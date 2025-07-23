import {
  organizationApiGetOptions,
  userApiCreateMutation,
} from "@/client/@tanstack/react-query.gen";
import type { zCreateUserRequest } from "@/client/zod.gen";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogForm } from "@/components/ui/dialog-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  userId: z.string().min(1, {
    message: "ユーザーIDを入力してください",
  }),
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  password: z.string().min(1, {
    message: "パスワードを入力してください",
  }),
  organizationId: z.string().optional(),
  role: z.enum(["SuperAdmin", "Manager", "Operator"], {
    required_error: "ロールを選択してください",
  }),
});

export const OrganizationCreateUserDialog = ({
  isOpenCreateUserDialog,
  setIsOpenCreateUserDialog,
  organizationId,
}: {
  isOpenCreateUserDialog: boolean;
  setIsOpenCreateUserDialog: (isOpen: boolean) => void;
  organizationId: string;
}) => {
  const { account } = useAuthStore.getState();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...userApiCreateMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.name}」を作成しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: organizationApiGetOptions({
          path: {
            id: organizationId,
          },
        }).queryKey,
      });
    },
    onError: (error) => {
      toast.error(
        error.message === "Conflict"
          ? "使用できないユーザーIDです"
          : error.message || "エラーが発生しました",
        { duration: 1000 }
      );
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof zCreateUserRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      name: "",
      password: "",
      organizationId: organizationId,
      role: undefined,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zCreateUserRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: data,
    });
    setIsOpenCreateUserDialog(false);
    reset();
  };

  return (
    <DialogForm
      open={isOpenCreateUserDialog}
      onOpenChange={(open) => {
        setIsOpenCreateUserDialog(open);
        reset();
      }}
      formProps={{
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogHeader>
        <DialogTitle>ユーザーを新規作成</DialogTitle>
        <DialogDescription>新しく作成するユーザーの情報を設定してください。</DialogDescription>
      </DialogHeader>
      <Controller
        control={control}
        name="userId"
        render={({ field }) => (
          <Input type="text" placeholder="ユーザーIDを入力してください" {...field} />
        )}
      />
      {errors.userId?.message && <p className="text-red-700">{errors.userId.message}</p>}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input type="text" placeholder="ユーザー名を入力してください" {...field} />
        )}
      />
      {errors.name?.message && <p className="text-red-700">{errors.name.message}</p>}
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input type="password" placeholder="パスワードを入力してください" {...field} />
        )}
      />
      {errors.password?.message && <p className="text-red-700">{errors.password.message}</p>}
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ロールを選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>ロール</SelectLabel>
                {account?.role === "SuperAdmin" && (
                  <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                )}
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Operator">Operator</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      {errors.role?.message && <p className="text-red-700">{errors.role.message}</p>}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>キャンセル</Button>
        </DialogClose>
        <Button type="submit">作成する</Button>
      </DialogFooter>
    </DialogForm>
  );
};
