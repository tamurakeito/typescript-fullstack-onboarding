import type { Account as UserType } from "@/client";
import {
  organizationApiGetOptions,
  userApiDeleteMutation,
} from "@/client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogForm } from "@/components/ui/dialog-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

export const UserDeleteDialog = ({
  isOpenDeleteUserDialog,
  setIsOpenDeleteUserDialog,
  organizationId,
  user,
  setSelectedUser,
}: {
  isOpenDeleteUserDialog: boolean;
  setIsOpenDeleteUserDialog: (isOpenDeleteUserDialog: boolean) => void;
  organizationId: string;
  user: UserType;
  setSelectedUser: (user: UserType | undefined) => void;
}) => {
  const queryClient = useQueryClient();

  const resetDialogState = () => {
    setIsOpenDeleteUserDialog(false);
    setSelectedUser(undefined);
  };

  const mutation = useMutation({
    ...userApiDeleteMutation(),
    onSuccess: () => {
      toast.success(`「${user.name}」を削除しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: organizationApiGetOptions({
          path: {
            id: organizationId,
          },
        }).queryKey,
      });
      resetDialogState();
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました", { duration: 500 });
      resetDialogState();
    },
  });

  const { handleSubmit } = useForm<never>();

  const onSubmit: SubmitHandler<never> = async () => {
    await mutation.mutateAsync({
      path: {
        id: user.id,
      },
    });
  };

  return (
    <DialogForm
      open={isOpenDeleteUserDialog}
      onOpenChange={resetDialogState}
      formProps={{
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogHeader>
        <DialogTitle>「{user.name}」を削除します</DialogTitle>
        <DialogDescription>この操作は元に戻せません。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>キャンセル</Button>
        </DialogClose>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "削除中..." : "削除する"}
        </Button>
      </DialogFooter>
    </DialogForm>
  );
};
