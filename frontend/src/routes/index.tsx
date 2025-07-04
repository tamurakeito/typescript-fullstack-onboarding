import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Hello World</h1>
          <p className="text-muted-foreground">
            TypeScript Fullstack Onboarding with TanStack Router
          </p>
        </div>

        <div className="space-y-4">
          <a href="/about">About Page</a>
        </div>
      </div>
    </div>
  );
}
