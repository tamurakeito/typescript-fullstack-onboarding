import type { TodoItem as TodoType } from "@/client";
import {
  todoDeleteMutation,
  todoGetListOptions,
  todoUpdateMutation,
} from "@/client/@tanstack/react-query.gen";
import type { zUpdateTodoItemRequest } from "@/client/zod.gen";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "タスクを入力してください。",
  }),
  description: z.string().min(1, {
    message: "説明を入力してください。",
  }),
  status: z.enum(["NotStarted", "InProgress", "Completed"]),
});

export const TodoUpdateDeleteDialog = ({
  isOpenUpdateDeleteDialog,
  setIsOpenUpdateDeleteDialog,
  todo,
  setSelectedTodo,
  organizationId,
}: {
  isOpenUpdateDeleteDialog: boolean;
  setIsOpenUpdateDeleteDialog: (isOpenUpdateDialog: boolean) => void;
  todo: TodoType;
  setSelectedTodo: (todo: TodoType | undefined) => void;
  organizationId: string;
}) => {
  const queryClient = useQueryClient();

  const resetDialogState = () => {
    setSelectedTodo(undefined);
    setIsOpenUpdateDeleteDialog(false);
  };

  const mutation = useMutation({
    ...todoUpdateMutation(),
    onSuccess: (data) => {
      toast.success(`「${data.title}」を更新しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: todoGetListOptions({
          path: {
            organizationId,
          },
        }).queryKey,
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
  } = useForm<z.infer<typeof zUpdateTodoItemRequest>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description,
      status: todo.status,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof zUpdateTodoItemRequest>> = async (data) => {
    await mutation.mutateAsync({
      body: data,
      path: {
        id: todo.id,
      },
    });
    resetDialogState();
    reset();
  };

  const deleteMutation = useMutation({
    ...todoDeleteMutation(),
    onSuccess: () => {
      toast.success(`「${todo.title}」を削除しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: todoGetListOptions({
          path: {
            organizationId,
          },
        }).queryKey,
      });
      resetDialogState();
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました", { duration: 500 });
    },
  });

  return (
    <DialogForm
      open={isOpenUpdateDeleteDialog}
      onOpenChange={resetDialogState}
      formProps={{
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogHeader>
        <DialogTitle>タスクを編集・削除</DialogTitle>
        <DialogDescription>タスクの内容を変更できます。</DialogDescription>
      </DialogHeader>
      <Label>タスク</Label>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input type="text" placeholder="タスクを入力してください" {...field} />
        )}
      />
      {errors.title?.message && <p className="text-red-700">{errors.title.message}</p>}
      <Label>説明</Label>
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input type="text" placeholder="タスクの説明を入力してください" {...field} />
        )}
      />
      {errors.description?.message && <p className="text-red-700">{errors.description.message}</p>}
      <Label>ステータス</Label>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ステータスを選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NotStarted">未着手</SelectItem>
              <SelectItem value="InProgress">進行中</SelectItem>
              <SelectItem value="Completed">完了</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.status?.message && <p className="text-red-700">{errors.status.message}</p>}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>キャンセル</Button>
        </DialogClose>
        <Button type="submit">保存する</Button>
        <Button
          type="button"
          variant={"destructive"}
          onClick={() => {
            deleteMutation.mutate({ path: { id: todo.id } });
          }}
        >
          削除する
        </Button>
      </DialogFooter>
    </DialogForm>
  );
};
