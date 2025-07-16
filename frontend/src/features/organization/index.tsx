import type { Organization as OrganizationType } from "@/client";
import { Button } from "@/components/ui/button";
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
import { OrganizationCreateDialog } from "./dialog/create-dialog";
import { OrganizationDeleteDialog } from "./dialog/delete-dialog";
import { OrganizationUpdateDialog } from "./dialog/update-dialog";

export const Organization = ({
  organizationList,
}: {
  organizationList: Array<OrganizationType>;
}) => {
  const navigate = useNavigate();
  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<OrganizationType | undefined>(undefined);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<OrganizationType | undefined>(undefined);

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
              setIsOpenCreateDialog(true);
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
              {organizationList.map((org) => (
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
                            console.log(org);
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
      <OrganizationCreateDialog
        isOpenCreateDialog={isOpenCreateDialog}
        setIsOpenCreateDialog={setIsOpenCreateDialog}
      />
      <OrganizationUpdateDialog
        openEditDialog={openEditDialog}
        setOpenEditDialog={setOpenEditDialog}
      />
      <OrganizationDeleteDialog
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
      />
    </div>
  );
};
