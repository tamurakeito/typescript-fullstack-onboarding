import type { Role } from "@/client/types.gen";
import { Badge } from "@/components/ui/badge";
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
    const { account, signOut } = useAuthStore();
    const navigate = useNavigate();

    const allowedRoles: Array<Role> = ["SuperAdmin", "Manager"];
    const supperAdminRoles: Array<Role> = ["SuperAdmin"];

    const handleSignOut = () => {
      toast.success("サインアウトしました", { duration: 500 });
      signOut();
      navigate({ to: "/sign-in" });
    };

    return (
      <div className="m-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="flex items-center justify-between px-6 py-2 border-b">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">組織用Todo管理システム</h1>
            <NavigationMenu>
              <NavigationMenuList>
                {supperAdminRoles.includes(account?.role as Role) ? (
                  <NavigationMenuItem>
                    <NavigationMenuLink href="/admin/organizations">組織管理</NavigationMenuLink>
                  </NavigationMenuItem>
                ) : (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink href={`/organizations/${account?.organizationId}/todos`}>
                        Todoリスト
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink href={`/organizations/${account?.organizationId}/users`}>
                        {allowedRoles.includes(account?.role as Role) ? "ユーザー管理" : "ユーザー"}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}
                <NavigationMenuItem>
                  <NavigationMenuLink href="/account">アカウント</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border rounded-lg px-4 py-2">
              <Badge>{account?.role}</Badge>
              <p className="font-semibold text-l text-gray-700">{account?.name}</p>
            </div>
            <Button className="bg-gray-600 hover:bg-gray-700" onClick={handleSignOut}>
              サインアウト
            </Button>
          </div>
        </header>
        <Outlet />
      </div>
    );
  },
  beforeLoad: () => {
    const { account, token } = useAuthStore.getState();
    if (!account || !token) {
      toast.error("アカウント情報が見つかりませんでした。再度ログインしてください。", {
        duration: 1000,
      });
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
