import { authLoginMutation } from "@/client/@tanstack/react-query.gen";
import { type zSignInRequest, zSignInResponse } from "@/client/zod.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  userId: z.string().min(1, {
    message: "ユーザーIDを入力してください。",
  }),
  password: z.string().min(1, {
    message: "パスワードを入力してください。",
  }),
});

export const SignIn = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: "/sign-in" });

  const mutation = useMutation({
    ...authLoginMutation(),
    onSuccess: (data) => {
      const validationResult = zSignInResponse.safeParse(data);
      if (!validationResult.success) {
        toast.error("ユーザー情報の取得に失敗しました", { duration: 500 });
        return;
      }
      const response = validationResult.data;

      toast.success("サインインしました", { duration: 500 });
      useAuthStore.getState().signIn(response.account, response.token);

      const redirectParam = (search as { redirect?: string }).redirect;
      const redirectTo = redirectParam ? new URL(redirectParam).pathname : "/";
      navigate({ to: redirectTo as "/" });
    },
    onError: (error) => {
      if (error.message === "Unauthorized") {
        toast.error("ユーザーIDまたはパスワードが間違っています", { duration: 500 });
      } else {
        toast.error(error.message || "エラーが発生しました", { duration: 500 });
      }
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof zSignInRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zSignInRequest>> = async (data) => {
    console.log(data);
    const result = await mutation.mutateAsync({
      body: data,
    });
    console.log(result);
  };

  useEffect(() => {
    useAuthStore.getState().signOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">組織用Todo管理システム</h1>
            <p className="text-gray-500">ユーザーIDとパスワードを入力してください</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Controller
              control={control}
              name="userId"
              render={({ field }) => (
                <>
                  <Input
                    type="text"
                    placeholder="ユーザーIDを入力"
                    className="h-12 px-4"
                    {...field}
                  />
                  {errors.userId && (
                    <p className="text-sm text-red-700 px-2">{errors.userId.message}</p>
                  )}
                </>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <>
                  <Input
                    type="password"
                    placeholder="パスワードを入力"
                    className="h-12 px-4"
                    {...field}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-700 px-2">{errors.password.message}</p>
                  )}
                </>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              ログイン
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
