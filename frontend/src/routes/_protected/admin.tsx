import type { Role } from "@/client/types.gen";
import { useAuthStore } from "@/store/auth-store";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/admin")({
  component: RouteComponent,
  beforeLoad: () => {
    const { account } = useAuthStore.getState();
    const allowedRoles: Array<Role> = ["SuperAdmin"];
    if (!allowedRoles.includes(account?.role as Role)) {
      if (account?.organizationId) {
        toast.error("このページにはアクセスできません。", { duration: 2000 });
        throw redirect({
          to: "/",
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

function RouteComponent() {
  return <Outlet />;
}
