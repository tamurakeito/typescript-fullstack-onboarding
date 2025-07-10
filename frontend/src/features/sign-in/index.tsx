import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
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

  const mutation = useMutation({
    mutationFn: (formData: z.infer<typeof formSchema>) => {
      return fetch("http://localhost:51002/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();
    const form = e.currentTarget;

    const userIdElement = form.elements.namedItem("userId");
    const passwordElement = form.elements.namedItem("password");
    const submitElement = form.elements.namedItem("submit");

    if (userIdElement === document.activeElement) {
      (passwordElement as HTMLInputElement)?.focus();
    }
    if (passwordElement === document.activeElement) {
      (submitElement as HTMLButtonElement)?.focus();
    }
    if (submitElement === document.activeElement) {
      (submitElement as HTMLButtonElement)?.click();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const result = await mutation.mutateAsync(values);
    console.log(result);

    if (result.ok) {
      toast.success("サインインしました");
      navigate({ to: "/" });
    } else {
      if (result.status === 400) {
        toast.error("不正なリクエストです");
      }
      if (result.status === 401) {
        toast.error("ユーザーIDまたはパスワードが間違っています");
      }
      if (result.status === 500) {
        toast.error("サーバーエラーが発生しました");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">組織用Todo管理システム</h1>
            <p className="text-gray-500">ユーザーIDとパスワードを入力してください</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={handleKeyDown}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">ユーザーID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ユーザーIDを入力"
                        className="h-12 px-4 border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">パスワード</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="パスワードを入力"
                        className="h-12 px-4 border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                name="submit"
                className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
              >
                サインイン
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
