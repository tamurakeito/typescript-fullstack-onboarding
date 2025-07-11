import { authLoginMutation } from "@/client/@tanstack/react-query.gen";
import { type zSignInRequest, zSignInResponse } from "@/client/zod.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "./auth-provider";

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
  const { setAuth } = useAuth();

  const mutation = useMutation({
    ...authLoginMutation(),
    onSuccess: (data) => {
      const validationResult = zSignInResponse.safeParse(data);
      if (!validationResult.success) {
        toast.error("ユーザー情報の取得に失敗しました");
        return;
      }
      const response = validationResult.data;

      toast.success("サインインしました");
      setAuth(response.account, response.token);
      navigate({ to: "/" });
    },
    onError: (error) => {
      if (error.message === "Unauthorized") {
        toast.error("ユーザーIDまたはパスワードが間違っています");
      } else {
        toast.error(error.message || "エラーが発生しました");
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
