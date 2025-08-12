import { userApiGetOptions, userApiUpdateMutation } from "@/client/@tanstack/react-query.gen";
import type { UserProfile } from "@/client/types.gen";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Account = ({ profile }: { profile: UserProfile }) => {
  const { account, token } = useLoaderData({ from: "/_protected/account/" });
  const { setAccount } = useAuthStore.getState();
  const [isUserIdEdit, setIsUserIdEdit] = useState<boolean>(false);
  const [isNameEdit, setIsNameEdit] = useState<boolean>(false);
  const [isPasswordEdit, setIsPasswordEdit] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const accountFormSchema = z
    .object({
      userId: z.string().refine(
        (val) => {
          if (isUserIdEdit) {
            return val.length > 0;
          }
          return true;
        },
        {
          message: "ユーザーIDを入力してください",
        }
      ),
      name: z.string().refine(
        (val) => {
          if (isNameEdit) {
            return val.length > 0;
          }
          return true;
        },
        {
          message: "名前を入力してください",
        }
      ),
      password: z.string().refine(
        (val) => {
          if (isPasswordEdit) {
            return val.length > 0;
          }
          return true;
        },
        {
          message: "パスワードを入力してください",
        }
      ),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (isPasswordEdit && data.password !== data.confirmPassword) {
          return false;
        }
        return true;
      },
      {
        message: "パスワードが一致しません",
        path: ["confirmPassword"],
      }
    );

  type AccountFormData = z.infer<typeof accountFormSchema>;

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
    setValue,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      userId: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    await mutation.mutateAsync({
      body: {
        userId: data.userId,
        name: data.name,
        password: data.password,
      },
      path: {
        id: account.id,
      },
    });
    setIsUserIdEdit(false);
    setIsNameEdit(false);
    setIsPasswordEdit(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    reset();
  };

  const resetPasswordEdit = () => {
    setIsPasswordEdit(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    reset();
  };

  return (
    <div className="h-screen flex p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md h-fit mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">アカウント情報</h1>
        <div className="flex flex-col gap-2 border-b pb-4">
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
                      setValue("userId", profile.userId);
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
                      disabled={mutation.isPending}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mutation.isPending ? "保存中..." : "保存"}</p>
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
        </div>
        <div className="flex flex-col gap-2 border-b pb-4">
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
                      setValue("name", profile.name);
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
                      disabled={mutation.isPending}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mutation.isPending ? "保存中..." : "保存"}</p>
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
        </div>
        <div className="flex flex-col gap-2 border-b pb-4">
          <span className="text-xs text-gray-400">パスワード</span>
          <div className="flex items-center justify-between">
            <div className="w-full">
              {!isPasswordEdit ? (
                <span className="text-base text-gray-400 tracking-widest select-none">
                  ●●●●●●●●
                </span>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Controller
                      control={control}
                      name="password"
                      render={({ field }) => (
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="新しいパスワードを入力してください"
                          className="pr-10"
                          {...field}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="もう一度パスワードを入力してください"
                          className="pr-10"
                          {...field}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                      disabled={mutation.isPending}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mutation.isPending ? "保存中..." : "保存"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <X
                      size={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        resetPasswordEdit();
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
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
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
      </form>
    </div>
  );
};
