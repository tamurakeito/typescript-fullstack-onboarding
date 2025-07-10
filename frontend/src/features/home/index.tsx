import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../sign-in/auth-provider";

export const Home = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSignOut = () => {
    localStorage.removeItem("account");
    localStorage.removeItem("token");
    setAuth(undefined, undefined);
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
