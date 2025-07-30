import { todoCreateMutation, todoGetListOptions } from "@/client/@tanstack/react-query.gen";
import type { zCreateTodoItemRequest } from "@/client/zod.gen";
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
  title: z.string().min(1, {
    message: "タスク名を入力してください。",
  }),
  description: z.string().min(1, {
    message: "タスクの説明を入力してください。",
  }),
  organizationId: z.string(),
});

export const TodoCreateDialog = ({
  isOpenCreateDialog,
  setIsOpenCreateDialog,
  organizationId,
}: {
  isOpenCreateDialog: boolean;
  setIsOpenCreateDialog: (isOpen: boolean) => void;
  organizationId: string;
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...todoCreateMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.title}」を作成しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: todoGetListOptions({
          path: {
            id: organizationId,
          },
        }).queryKey,
      });
      reset();
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
  } = useForm<z.infer<typeof zCreateTodoItemRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationId: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zCreateTodoItemRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: {
        title: data.title,
        description: data.description,
        organizationId,
      },
    });
    setIsOpenCreateDialog(false);
  };

  return (
    <DialogForm
      open={isOpenCreateDialog}
      onOpenChange={() => setIsOpenCreateDialog(false)}
      formProps={{
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogHeader>
        <DialogTitle>タスクを新規作成</DialogTitle>
        <DialogDescription>新しく作成するタスクを設定してください。</DialogDescription>
      </DialogHeader>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input type="text" placeholder="タスク名を入力してください" {...field} />
        )}
      />
      {errors.title?.message && <p className="text-red-700">{errors.title.message}</p>}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input type="text" placeholder="タスクの説明を入力してください" {...field} />
        )}
      />
      {errors.description?.message && <p className="text-red-700">{errors.description.message}</p>}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>キャンセル</Button>
        </DialogClose>
        <Button type="submit">作成する</Button>
      </DialogFooter>
    </DialogForm>
  );
};
