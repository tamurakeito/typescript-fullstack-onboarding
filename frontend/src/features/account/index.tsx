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

const userIdFormSchema = z.object({
  userId: z.string().min(1, {
    message: "ユーザーIDを入力してください",
  }),
});

const nameFormSchema = z.object({
  name: z.string().min(1, {
    message: "名前を入力してください",
  }),
});

const passwordFormSchema = z.object({
  password: z.string().min(1, {
    message: "パスワードを入力してください",
  }),
});

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
    control: userIdControl,
    handleSubmit: handleUserIdSubmit,
    formState: { errors: userIdErrors },
    reset: resetUserId,
  } = useForm<z.infer<typeof userIdFormSchema>>({
    resolver: zodResolver(userIdFormSchema),
    defaultValues: {
      userId: profile.userId,
    },
  });

  const {
    control: nameControl,
    handleSubmit: handleNameSubmit,
    formState: { errors: nameErrors },
    reset: resetName,
  } = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: profile.name,
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmitUserId: SubmitHandler<z.infer<typeof userIdFormSchema>> = async (data) => {
    await mutation.mutateAsync({
      body: {
        ...data,
        name: "",
        password: "",
      },
      path: {
        id: account.id,
      },
    });
    setIsUserIdEdit(false);
    resetUserId({ userId: data.userId });
  };

  const onSubmitName: SubmitHandler<z.infer<typeof nameFormSchema>> = async (data) => {
    await mutation.mutateAsync({
      body: {
        ...data,
        userId: "",
        password: "",
      },
      path: {
        id: account.id,
      },
    });
    setIsNameEdit(false);
    resetName({ name: data.name });
  };

  const onSubmitPassword: SubmitHandler<z.infer<typeof passwordFormSchema>> = async (data) => {
    await mutation.mutateAsync({
      body: {
        ...data,
        userId: "",
        name: "",
      },
      path: {
        id: account.id,
      },
    });
    setIsPasswordEdit(false);
    resetPassword({ password: data.password });
  };

  return (
    <div className="h-screen flex p-6">
      <div className="w-full max-w-md h-fit mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">アカウント情報</h1>
        <form
          onSubmit={handleUserIdSubmit(onSubmitUserId)}
          className="flex flex-col gap-2 border-b pb-4"
        >
          <span className="text-xs text-gray-400">ユーザーID</span>
          <div className="flex items-center justify-between">
            <span className="text-base font-mono text-gray-700 w-full">
              {!isUserIdEdit ? (
                profile.userId
              ) : (
                <Controller
                  control={userIdControl}
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
                        resetUserId();
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
          {userIdErrors.userId && <p className="text-red-500">{userIdErrors.userId.message}</p>}
        </form>
        <form
          onSubmit={handleNameSubmit(onSubmitName)}
          className="flex flex-col gap-2 border-b pb-4"
        >
          <span className="text-xs text-gray-400">名前</span>
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-700 w-full">
              {!isNameEdit ? (
                profile.name
              ) : (
                <Controller
                  control={nameControl}
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
                        resetName();
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
          {nameErrors.name && <p className="text-red-500">{nameErrors.name.message}</p>}
        </form>
        <form
          onSubmit={handlePasswordSubmit(onSubmitPassword)}
          className="flex flex-col gap-2 border-b pb-4"
        >
          <span className="text-xs text-gray-400">パスワード</span>
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-400 tracking-widest select-none w-full">
              {!isPasswordEdit ? (
                "●●●●●●●●"
              ) : (
                <Controller
                  control={passwordControl}
                  name="password"
                  render={({ field }) => (
                    <Input
                      type="password"
                      placeholder="新しいパスワードを入力してください"
                      {...field}
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
                        resetPassword();
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
          {passwordErrors.password && (
            <p className="text-red-500">{passwordErrors.password.message}</p>
          )}
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
