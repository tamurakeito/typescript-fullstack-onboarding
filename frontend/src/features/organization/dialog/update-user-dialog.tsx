import type { Account as UserType } from "@/client";
import {
  organizationApiGetOptions,
  userApiUpdateRoleMutation,
} from "@/client/@tanstack/react-query.gen";
import type { zUpdateUserRoleRequest } from "@/client/zod.gen";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogForm } from "@/components/ui/dialog-form";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  role: z.enum(["SuperAdmin", "Manager", "Operator"], {
    required_error: "ロールを選択してください",
  }),
});

export const OrganizationUpdateUserDialog = ({
  isOpenUpdateUserDialog,
  setIsOpenUpdateUserDialog,
  organizationId,
  user,
  setSelectedUser,
}: {
  isOpenUpdateUserDialog: boolean;
  setIsOpenUpdateUserDialog: (isOpenUpdateUserDialog: boolean) => void;
  organizationId: string;
  user: UserType;
  setSelectedUser: (user: UserType | undefined) => void;
}) => {
  const { account } = useAuthStore.getState();

  const queryClient = useQueryClient();

  const resetDialogState = () => {
    setIsOpenUpdateUserDialog(false);
    setSelectedUser(undefined);
  };

  const mutation = useMutation({
    ...userApiUpdateRoleMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.name}」のロールを更新しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: organizationApiGetOptions({
          path: {
            id: organizationId,
          },
        }).queryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました", { duration: 1000 });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof zUpdateUserRoleRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: user.role,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zUpdateUserRoleRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: data,
      path: {
        id: user.id,
      },
    });
    resetDialogState();
    reset();
  };

  return (
    <DialogForm
      open={isOpenUpdateUserDialog}
      onOpenChange={resetDialogState}
      formProps={{
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogHeader>
        <DialogTitle>ユーザーを編集</DialogTitle>
        <DialogDescription>ユーザーのロールを変更できます。</DialogDescription>
      </DialogHeader>
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
        <Button type="submit">更新する</Button>
      </DialogFooter>
    </DialogForm>
  );
};
