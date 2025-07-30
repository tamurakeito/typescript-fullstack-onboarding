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
  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState<boolean>(false);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState<boolean>(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationType | undefined>(
    undefined
  );
  const navigate = useNavigate();
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
                <TableHead className="w-[120px]"> </TableHead>
                <TableHead className="w-[120px]"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizationList.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      onClick={() => navigate({ to: `/organizations/${org.id}/todos` })}
                    >
                      Todoリスト
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      onClick={() => navigate({ to: `/organizations/${org.id}/users` })}
                    >
                      ユーザー管理
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Pencil
                            size={20}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpenEditDialog(true);
                              setSelectedOrganization(org);
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
                              setIsOpenDeleteDialog(true);
                              setSelectedOrganization(org);
                            }}
                            className="text-gray-600 hover:text-gray-900 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>削除</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
      {!!selectedOrganization && (
        <OrganizationUpdateDialog
          isOpenEditDialog={isOpenEditDialog}
          setIsOpenEditDialog={setIsOpenEditDialog}
          organization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
        />
      )}
      {!!selectedOrganization && (
        <OrganizationDeleteDialog
          isOpenDeleteDialog={isOpenDeleteDialog}
          setIsOpenDeleteDialog={setIsOpenDeleteDialog}
          organization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
        />
      )}
    </div>
  );
};
