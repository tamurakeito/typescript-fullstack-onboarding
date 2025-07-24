import { userApiGetOptions } from "@/client/@tanstack/react-query.gen";
import { Account } from "@/features/account";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/account/")({
  loader: async () => {
    const { account, token } = useAuthStore.getState();
    if (!account || !token) {
      // 理論上ここには到達しない
      throw new Error("No Authentication Data");
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
