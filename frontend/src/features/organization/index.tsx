import type { Organization } from "@/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const organizations = [
  {
    id: "e3fa477b-333b-452c-8528-7ac7742c29fb",
    name: "株式会社テックソリューション",
  },
  {
    id: "e3fa477b-333b-452c-8528-7ac7742c29fb",
    name: "スタートアップXYZ",
  },
  {
    id: "e3fa477b-333b-452c-8528-7ac7742c29fb",
    name: "デザインスタジオABC",
  },
  {
    id: "e3fa477b-333b-452c-8528-7ac7742c29fb",
    name: "マーケティングエージェンシー",
  },
];

export const OrganizationBoard = () => {
  const navigate = useNavigate();
  const [openCreateDialog, setOpenCreateDialog] = useState<string | undefined>(undefined);
  const [openEditDialog, setOpenEditDialog] = useState<Organization | undefined>(undefined);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<Organization | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">組織管理</h1>
          <p className="text-gray-600">登録されている組織一覧</p>
        </div>
        <div className="w-full flex justify-end mb-2">
          <Button
            onClick={() => {
              setOpenCreateDialog("");
            }}
          >
            新規作成
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-l font-semibold text-gray-900">組織一覧</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>組織名</TableHead>
                <TableHead className="w-[120px]"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow
                  key={org.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: `/organization/${org.id}` })}
                >
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="flex justify-center items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Pencil
                          size={20}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenEditDialog(org);
                          }}
                          className="text-gray-600 hover:text-gray-900 mr-6 cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>編集</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Trash2
                          size={20}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDeleteDialog(org);
                          }}
                          className="text-gray-600 hover:text-gray-900 cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>削除</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 新規作成ダイアログ */}
      <Dialog
        open={openCreateDialog !== undefined}
        onOpenChange={() => setOpenCreateDialog(undefined)}
      >
        <form action="">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>組織を新規作成</DialogTitle>
            </DialogHeader>
            <div>新しく作成する組織の名称を設定してください。</div>
            <Input type="text" placeholder="組織名を入力してください" value={openCreateDialog} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"}>キャンセル</Button>
              </DialogClose>
              <DialogClose>
                <Button
                  onClick={() => {
                    toast.success(`「${openCreateDialog}」を作成しました`, { duration: 1000 });
                  }}
                >
                  作成する
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={openEditDialog !== undefined} onOpenChange={() => setOpenEditDialog(undefined)}>
        <form action="">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>組織名を編集</DialogTitle>
            </DialogHeader>
            <div>組織の名称を変更できます。</div>
            <Input
              type="text"
              placeholder="組織名を入力してください"
              value={openEditDialog?.name}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"}>キャンセル</Button>
              </DialogClose>
              <DialogClose>
                <Button
                  onClick={() => {
                    toast.success("名前を変更しました", { duration: 1000 });
                  }}
                >
                  保存する
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {/* 削除ダイアログ */}
      <Dialog
        open={openDeleteDialog !== undefined}
        onOpenChange={() => setOpenDeleteDialog(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>「{openDeleteDialog?.name}」を削除します</DialogTitle>
          </DialogHeader>
          <div>この操作は元に戻せません。</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>キャンセル</Button>
            </DialogClose>
            <DialogClose>
              <Button
                onClick={() => {
                  toast.success(`「${openDeleteDialog?.name}」を削除しました`, { duration: 1000 });
                }}
              >
                削除する
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
