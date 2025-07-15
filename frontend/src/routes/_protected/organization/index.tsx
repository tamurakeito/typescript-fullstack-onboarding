import { organizationApiGetListOptions } from "@/client/@tanstack/react-query.gen";
import type { Role } from "@/client/types.gen";
import { Organization } from "@/features/organization";
import { useAuthStore } from "@/store/auth-store";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/organization/")({
  loader: async () => {
    const queryClient = new QueryClient();
    await queryClient.ensureQueryData(organizationApiGetListOptions());
    return {
      queryClient,
    };
  },
  component: () => {
    const { data: organizationList } = useSuspenseQuery(organizationApiGetListOptions());
    return <Organization organizationList={organizationList} />;
  },
  beforeLoad: () => {
    const { account } = useAuthStore.getState();
    const allowedRoles: Array<Role> = ["SuperAdmin"];
    if (!allowedRoles.includes(account?.role as Role)) {
      if (account?.organizationId) {
        throw redirect({
          to: "/organization/$organizationId",
          params: { organizationId: account.organizationId },
        });
      }
      toast.error("エラーが発生しました。もう一度サインインしてください。", { duration: 2000 });
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
