import { userApiGetOptions } from "@/client/@tanstack/react-query.gen";
import { Account } from "@/features/account";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useLoaderData } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/account/")({
  loader: async () => {
    const { account, token } = useAuthStore.getState();
    if (!account || !token) {
      toast.error("アカウント情報が見つかりませんでした。再度ログインしてください。", {
        duration: 1000,
      });
      throw redirect({ to: "/sign-in" });
    }
    await queryClient.ensureQueryData(
      userApiGetOptions({
        path: {
          id: account.id,
        },
      })
    );
    return { account, token };
  },
  component: () => {
    const { account } = useLoaderData({ from: "/_protected/account/" });
    const { data: profile } = useSuspenseQuery(
      userApiGetOptions({
        path: {
          id: account.id,
        },
      })
    );
    return <Account profile={profile} />;
  },
});
