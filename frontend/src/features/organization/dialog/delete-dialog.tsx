import type { Organization as OrganizationType } from "@/client";
import {
  organizationApiDeleteMutation,
  organizationApiGetListOptions,
} from "@/client/@tanstack/react-query.gen";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const OrganizationDeleteDialog = ({
  openDeleteDialog,
  setOpenDeleteDialog,
}: {
  openDeleteDialog: OrganizationType | undefined;
  setOpenDeleteDialog: (openDeleteDialog: OrganizationType | undefined) => void;
}) => {
  const queryClient = useQueryClient();
  const [deleteOrganizationName, setDeleteOrganizationName] = useState<string | undefined>(
    undefined
  );
  const mutation = useMutation({
    ...organizationApiDeleteMutation(),
    onSuccess: () => {
      toast.success(`「${deleteOrganizationName}」を削除しました`, { duration: 1000 });
      queryClient.refetchQueries({
        queryKey: organizationApiGetListOptions().queryKey,
      });
      setDeleteOrganizationName(undefined);
      setOpenDeleteDialog(undefined);
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました", { duration: 500 });
      setDeleteOrganizationName(undefined);
      setOpenDeleteDialog(undefined);
    },
  });
  return (
    <Dialog
      open={openDeleteDialog !== undefined}
      onOpenChange={() => setDeleteOrganizationName(undefined)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>「{openDeleteDialog?.name}」を削除します</DialogTitle>
          <DialogDescription>この操作は元に戻せません。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>キャンセル</Button>
          </DialogClose>
          <Button
            onClick={async () => {
              await setDeleteOrganizationName(openDeleteDialog?.name);
              mutation.mutate({
                path: {
                  id: openDeleteDialog?.id ?? "",
                },
              });
            }}
          >
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
