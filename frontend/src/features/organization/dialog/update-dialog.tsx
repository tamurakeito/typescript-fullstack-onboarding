import type { Organization as OrganizationType } from "@/client";
import { organizationApiUpdateMutation } from "@/client/@tanstack/react-query.gen";
import type { zUpdateOrganizationRequest } from "@/client/zod.gen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "組織名を入力してください。",
  }),
});

export const OrganizationUpdateDialog = ({
  openEditDialog,
  setOpenEditDialog,
}: {
  openEditDialog: OrganizationType | undefined;
  setOpenEditDialog: (openEditDialog: OrganizationType | undefined) => void;
}) => {
  const mutation = useMutation({
    ...organizationApiUpdateMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.name}」を更新しました`, { duration: 1000 });
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました", { duration: 500 });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof zUpdateOrganizationRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (openEditDialog) {
      reset({
        name: openEditDialog.name,
      });
    }
  }, [openEditDialog, reset]);

  const onSubmit: SubmitHandler<z.infer<typeof zUpdateOrganizationRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: data,
      path: {
        id: openEditDialog?.id ?? "",
      },
    });
    setOpenEditDialog(undefined);
    reset();
  };

  return (
    <Dialog open={openEditDialog !== undefined} onOpenChange={() => setOpenEditDialog(undefined)}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>組織名を編集</DialogTitle>
            <DialogDescription>組織の名称を変更できます。</DialogDescription>
          </DialogHeader>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input type="text" placeholder="組織名を入力してください" {...field} />
            )}
          />
          {errors.name?.message && <p className="text-red-700">{errors.name.message}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>キャンセル</Button>
            </DialogClose>
            <Button type="submit">保存する</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
