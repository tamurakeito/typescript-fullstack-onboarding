import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogForm } from "@/components/ui/dialog-form";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

export const AccountEditDialog = ({
  isOpenEditDialog,
  setIsOpenEditDialog,
}: {
  isOpenEditDialog: boolean;
  setIsOpenEditDialog: (isOpenEditDialog: boolean) => void;
}) => {
  const queryClient = useQueryClient();

  const resetDialogState = () => {
    setIsOpenEditDialog(false);
    setSelectedOrganization(undefined);
  };
  return (
    <DialogForm
      open={isOpenEditDialog}
      onOpenChange={resetDialogState}
      //   formProps={{
      //     onSubmit: handleSubmit(onSubmit),
      //   }}
    >
      <DialogHeader>
        <DialogTitle>アカウント情報を編集</DialogTitle>
        <DialogDescription>アカウント情報を変更できます。</DialogDescription>
      </DialogHeader>
      {/* <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input type="text" placeholder="組織名を入力してください" {...field} />
        )}
      />
      {errors.name?.message && <p className="text-red-700">{errors.name.message}</p>} */}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>キャンセル</Button>
        </DialogClose>
        <Button type="submit">保存する</Button>
      </DialogFooter>
    </DialogForm>
  );
};
