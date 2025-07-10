import { useAuthStore } from "@/store/auth-store"; // 作成したzustandストアをインポート
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: () => {
    const { account, token } = useAuthStore.getState();
    if (!account || !token) {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
