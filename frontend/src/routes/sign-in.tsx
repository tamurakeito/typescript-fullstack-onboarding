import { useAuthStore } from "@/store/auth-store";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { SignIn } from "../features/sign-in";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  beforeLoad: () => {
    const { account, token } = useAuthStore.getState();
    if (account && token) {
      toast.success(
        "サインイン済みです。別のアカウントでサインインするためには、一度ログインしてください。",
        { duration: 2000 }
      );
      throw redirect({
        to: "/",
      });
    }
  },
});

function SignInPage() {
  return <SignIn />;
}
