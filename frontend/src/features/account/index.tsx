import { userApiGetOptions, userApiUpdateMutation } from "@/client/@tanstack/react-query.gen";
import type { UserProfile } from "@/client/types.gen";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const untouchedPassword = "_untouched_";

const accountFormSchema = z.object({
  userId: z.string().min(1, {
    message: "ユーザーIDを入力してください",
  }),
  name: z.string().min(1, {
    message: "名前を入力してください",
  }),
  password: z.string().refine((val) => val !== untouchedPassword && val.length > 0, {
    message: "パスワードを入力してください",
  }),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

export const Account = ({ profile }: { profile: UserProfile }) => {
  const { account, token } = useLoaderData({ from: "/_protected/account/" });
  const { setAccount } = useAuthStore.getState();
  const [isUserIdEdit, setIsUserIdEdit] = useState<boolean>(false);
  const [isNameEdit, setIsNameEdit] = useState<boolean>(false);
  const [isPasswordEdit, setIsPasswordEdit] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...userApiUpdateMutation(),
    onSuccess: (data) => {
      toast.success("ユーザー情報を更新しました", { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: userApiGetOptions({
          path: {
            id: account.id,
          },
        }).queryKey,
      });
      setAccount(data, token);
    },
    onError: (error) => {
      toast.error(
        error.message === "Conflict"
          ? "使用できないユーザーIDです"
          : error.message || "エラーが発生しました",
        {
          duration: 1000,
        }
      );
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      userId: profile.userId,
      name: profile.name,
      password: untouchedPassword,
    },
  });

  const onSubmitUserId: SubmitHandler<AccountFormData> = async (data) => {
    await mutation.mutateAsync({
      body: {
        userId: data.userId,
        name: "",
        password: "",
      },
      path: {
        id: account.id,
      },
    });
    setIsUserIdEdit(false);
    reset({ ...getValues(), userId: data.userId });
  };

  const onSubmitName: SubmitHandler<AccountFormData> = async (data) => {
    await mutation.mutateAsync({
      body: {
        userId: "",
        name: data.name,
        password: "",
      },
      path: {
        id: account.id,
      },
    });
    setIsNameEdit(false);
    reset({ ...getValues(), name: data.name });
  };

  const onSubmitPassword: SubmitHandler<AccountFormData> = async (data) => {
    await mutation.mutateAsync({
      body: {
        userId: "",
        name: "",
        password: data.password,
      },
      path: {
        id: account.id,
      },
    });
    setIsPasswordEdit(false);
    reset({ ...getValues(), password: untouchedPassword });
  };

  return (
    <div className="h-screen flex p-6">
      <div className="w-full max-w-md h-fit mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">アカウント情報</h1>
        <form onSubmit={handleSubmit(onSubmitUserId)} className="flex flex-col gap-2 border-b pb-4">
          <span className="text-xs text-gray-400">ユーザーID</span>
          <div className="flex items-center justify-between">
            <span className="text-base font-mono text-gray-700 w-full">
              {!isUserIdEdit ? (
                profile.userId
              ) : (
                <Controller
                  control={control}
                  name="userId"
                  render={({ field }) => (
                    <Input type="text" placeholder="ユーザーIDを入力してください" {...field} />
                  )}
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
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-gray-900 cursor-pointer p-1"
                    >
                      <Check size={20} />
                    </button>
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
                        reset();
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
          {errors.userId && <p className="text-red-500">{errors.userId.message}</p>}
        </form>
        <form onSubmit={handleSubmit(onSubmitName)} className="flex flex-col gap-2 border-b pb-4">
          <span className="text-xs text-gray-400">名前</span>
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-700 w-full">
              {!isNameEdit ? (
                profile.name
              ) : (
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input type="text" placeholder="名前を入力してください" {...field} />
                  )}
                />
              )}
            </span>
            {!isNameEdit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pencil
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNameEdit(true);
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
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-gray-900 cursor-pointer p-1"
                    >
                      <Check size={20} />
                    </button>
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
                        setIsNameEdit(false);
                        reset();
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
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </form>
        <form
          onSubmit={handleSubmit(onSubmitPassword)}
          className="flex flex-col gap-2 border-b pb-4"
        >
          <span className="text-xs text-gray-400">パスワード</span>
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-400 tracking-widest select-none w-full">
              {!isPasswordEdit ? (
                "●●●●●●●●"
              ) : (
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      type="password"
                      placeholder="新しいパスワードを入力してください"
                      {...field}
                      value={field.value === "_untouched_" ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              )}
            </span>
            {!isPasswordEdit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pencil
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPasswordEdit(true);
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
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-gray-900 cursor-pointer p-1"
                    >
                      <Check size={20} />
                    </button>
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
                        setIsPasswordEdit(false);
                        reset();
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
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </form>
        {profile.organization && (
          <div className="flex flex-col gap-2 border-b pb-4">
            <span className="text-xs text-gray-400">所属</span>
            <span className="text-base text-gray-700">{profile.organization}</span>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">ロール</span>
          <Badge className="bg-gray-100 text-gray-700 text-md font-mono">{profile.role}</Badge>
        </div>
      </div>
    </div>
  );
};
