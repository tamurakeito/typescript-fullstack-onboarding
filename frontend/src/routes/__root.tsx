import { useAuthStore } from "@/store/auth-store";
import { Outlet, createRootRoute, createRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const RootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

export const protectedRoute = createRoute({
  getParentRoute: () => RootRoute,
  id: "_protected",
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
