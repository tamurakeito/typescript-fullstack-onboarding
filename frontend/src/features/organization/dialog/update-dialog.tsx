import type { Organization as OrganizationType } from "@/client";
import {
  organizationApiGetListOptions,
  organizationApiUpdateMutation,
} from "@/client/@tanstack/react-query.gen";
import type { zUpdateOrganizationRequest } from "@/client/zod.gen";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "組織名を入力してください。",
  }),
});

export const OrganizationUpdateDialog = ({
  isOpenEditDialog,
  setIsOpenEditDialog,
  organization,
  setSelectedOrganization,
}: {
  isOpenEditDialog: boolean;
  setIsOpenEditDialog: (isOpenEditDialog: boolean) => void;
  organization: OrganizationType;
  setSelectedOrganization: (organization: OrganizationType | undefined) => void;
}) => {
  const queryClient = useQueryClient();

  const resetDialogState = () => {
    setIsOpenEditDialog(false);
    setSelectedOrganization(undefined);
  };

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
      name: organization.name,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zUpdateOrganizationRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: data,
      path: {
        id: organization.id,
      },
    });
    resetDialogState();
    reset();
  };

  return (
    <DialogForm
      open={isOpenEditDialog}
      onOpenChange={resetDialogState}
      formProps={{
        onSubmit: handleSubmit(onSubmit),
      }}
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
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "保存中..." : "保存する"}
        </Button>
      </DialogFooter>
    </DialogForm>
  );
};
