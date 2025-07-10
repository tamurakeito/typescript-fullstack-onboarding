import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Home = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    toast.success("サインアウトしました");
    useAuthStore.getState().signOut();
    navigate({ to: "/sign-in" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 flex flex-col items-center">
        <div className="text-center space-y-2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Hello World</h1>
          <p className="text-muted-foreground">
            TypeScript Fullstack Onboarding with TanStack Router
          </p>
        </div>

        <div className="space-y-4">
          <a href="/about">About Page</a>
        </div>

        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  );
};
