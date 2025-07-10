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
import { useForm } from "react-hook-form";
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    mutation.mutate(values);
    console.log(mutation.data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">組織用Todo管理システム</h1>
            <p className="text-gray-500">ユーザーIDとパスワードを入力してください</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
