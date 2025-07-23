import { Account } from "@/features/account";
import { useAuthStore } from "@/store/auth-store";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/account/")({
  loader: async () => {
    const { account } = useAuthStore.getState();
    return { account };
  },
  component: () => {
    return <Account />;
  },
});
