import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useAuthStore } from "@/store/auth-store";
import { Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected")({
  component: () => {
    const navigate = useNavigate();

    const handleSignOut = () => {
      toast.success("サインアウトしました", { duration: 500 });
      useAuthStore.getState().signOut();
      navigate({ to: "/sign-in" });
    };

    return (
      <div className="m-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">組織用Todo管理システム</h1>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/">HOME</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/about">ABOUT</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={handleSignOut}>
            サインアウト
          </Button>
        </header>
        <Outlet />
      </div>
    );
  },
  beforeLoad: () => {
    const { account, token } = useAuthStore.getState();
    console.log("protected load!");
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
