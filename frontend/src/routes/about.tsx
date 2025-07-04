import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">About Page</h1>
          <p className="text-muted-foreground">This is the about page of our application</p>
        </div>

        <div className="space-y-4">
          <a href="/">Back to Home</a>
        </div>
      </div>
    </div>
  );
}
