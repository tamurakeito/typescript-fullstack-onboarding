export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 flex flex-col items-center">
        <div className="text-center space-y-2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Hello World</h1>
          <p className="text-muted-foreground">
            TypeScript Fullstack Onboarding with TanStack Router
          </p>
        </div>
      </div>
    </div>
  );
};
