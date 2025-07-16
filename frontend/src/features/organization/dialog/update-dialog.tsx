import type { Organization as OrganizationType } from "@/client";
import {
  organizationApiGetListOptions,
  organizationApiUpdateMutation,
} from "@/client/@tanstack/react-query.gen";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...organizationApiUpdateMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.name}」を更新しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: organizationApiGetListOptions().queryKey,
      });
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg"
        >
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
