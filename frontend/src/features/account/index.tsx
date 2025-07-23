import { userApiUpdateMutation } from "@/client/@tanstack/react-query.gen";
import type { zUpdateUserRequest } from "@/client/zod.gen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { redirect, useLoaderData } from "@tanstack/react-router";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// const formSchema = z.object({
//   userId: z.string().min(1, {
//     message: "ユーザーIDを入力してください。",
//   }),
//   name: z.string().min(1, {
//     message: "名前を入力してください。",
//   }),
//   password: z.string().min(1, {
//     message: "パスワードを入力してください。",
//   }),
// });

export const Account = () => {
  const { account } = useLoaderData({ from: "/_protected/account/" });
  if (!account) {
    toast.error("アカウント情報が見つかりませんでした。再度ログインしてください。", {
      duration: 1000,
    });
    throw redirect({ to: "/sign-in" });
  }
  const [isUserIdEdit, setIsUserIdEdit] = useState<boolean>(false);

  // const queryClient = useQueryClient();
  // const mutation = useMutation({
  //   ...userApiUpdateMutation(),
  //   onSuccess: (data) => {
  //     toast.success(`「${data.name}」を更新しました`, { duration: 1000 });
  //     // queryClient.refetchQueries({
  //     //   queryKey: organizationApiGetListOptions().queryKey,
  //     // });
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || "エラーが発生しました", { duration: 500 });
  //   },
  // });

  // const {
  //   control,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  // } = useForm<z.infer<typeof zUpdateUserRequest>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     userId: account.userId,
  //     name: account.name,
  //     password: "",
  //   },
  // });

  // const onSubmit: SubmitHandler<z.infer<typeof zUpdateUserRequest>> = async (data) => {
  //   await mutation.mutateAsync({
  //     body: data,
  //     path: {
  //       id: account.id,
  //     },
  //   });
  //   setIsEditable(false);
  //   reset();
  // };
  return (
    <div className="h-screen flex p-6">
      <form
        // onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md h-fit mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">アカウント情報</h1>
        <div className="flex flex-col gap-2 border-b pb-4">
          <span className="text-xs text-gray-400">ユーザーID</span>
          <div className="flex items-center justify-between">
            <span className="text-base font-mono text-gray-700 w-full">
              {!isUserIdEdit ? (
                account.userId
              ) : (
                <Input
                  type="text"
                  placeholder="ユーザーIDを入力してください"
                  value={account.userId}
                />
              )}
            </span>
            {!isUserIdEdit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pencil
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserIdEdit(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 mr-6 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>編集</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center pl-4 gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Check
                      size={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserIdEdit(false);
                      }}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <X
                      size={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserIdEdit(false);
                      }}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>キャンセル</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b pb-4">
          <span className="text-xs text-gray-400">名前</span>
          <span className="text-base text-gray-700">account.name</span>
        </div>
        <div className="flex flex-col gap-2 border-b pb-4">
          <span className="text-xs text-gray-400">パスワード</span>
          <span className="text-base text-gray-400 tracking-widest select-none">●●●●●●●●</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">ロール</span>
          <Badge className="bg-gray-100 text-gray-700 text-md font-mono">{account?.role}</Badge>
        </div>
      </form>
    </div>
  );
};
