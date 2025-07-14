import { useAuthStore } from "@/store/auth-store";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import * as React from "react";

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async () => {
    await useAuthStore.getState().initialize();
    console.log("root Load!");
  },
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
