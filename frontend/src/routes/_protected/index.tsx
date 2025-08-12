import { Home } from "@/features/home";
import { useAuthStore } from "@/store/auth-store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/")({
  component: Index,
  beforeLoad: async () => {
    const { account } = useAuthStore.getState();
    if (account?.role === "SuperAdmin") {
      throw redirect({ to: "/admin/organizations" });
    }
    if (account?.role === "Manager" || account?.role === "Operator") {
      throw redirect({ to: `/organizations/${account?.organizationId}/todos` as string });
    }
    throw redirect({ to: "/sign-in" });
  },
});

function Index() {
  return <Home />;
}
