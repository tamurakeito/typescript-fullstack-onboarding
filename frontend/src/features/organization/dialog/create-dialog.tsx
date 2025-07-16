import {
  organizationApiCreateMutation,
  organizationApiGetListOptions,
} from "@/client/@tanstack/react-query.gen";
import type { zCreateOrganizationRequest } from "@/client/zod.gen";
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
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "組織名を入力してください。",
  }),
});

export const OrganizationCreateDialog = ({
  isOpenCreateDialog,
  setIsOpenCreateDialog,
}: {
  isOpenCreateDialog: boolean;
  setIsOpenCreateDialog: (isOpen: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...organizationApiCreateMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.name}」を作成しました`, { duration: 1000 });
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
  } = useForm<z.infer<typeof zCreateOrganizationRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zCreateOrganizationRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: data,
    });
    setIsOpenCreateDialog(false);
    reset();
  };

  return (
    <Dialog open={isOpenCreateDialog} onOpenChange={() => setIsOpenCreateDialog(false)}>
      <DialogContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>組織を新規作成</DialogTitle>
            <DialogDescription>新しく作成する組織の名称を設定してください。</DialogDescription>
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
            <Button type="submit">作成する</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
