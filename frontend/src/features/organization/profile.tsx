import type { OrganizationProfile as OrganizationProfileType } from "@/client";
import type { Account as UserType } from "@/client";
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
import { useAuthStore } from "@/store/auth-store";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { UserCreateDialog } from "./dialog/create-user-dialog";
import { UserUpdateDialog } from "./dialog/update-user-dialog";

export const OrganizationProfile = ({
  organization,
}: { organization: OrganizationProfileType }) => {
  const [isOpenCreateUserDialog, setIsOpenCreateUserDialog] = useState<boolean>(false);
  const [isOpenUpdateUserDialog, setIsOpenUpdateUserDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined);
  const { account } = useAuthStore.getState();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
          <p className="text-gray-600">登録されているユーザー</p>
        </div>
        {(account?.role === "SuperAdmin" || account?.role === "Manager") && (
          <div className="w-full flex justify-end mb-2">
            <Button
              onClick={() => {
                setIsOpenCreateUserDialog(true);
              }}
            >
              新規ユーザー作成
            </Button>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-l font-semibold text-gray-900">ユーザー</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>名前</TableHead>
                <TableHead className="w-[100px]">ロール</TableHead>
                <TableHead className="w-[120px]"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.userId}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-medium">{user.role}</TableCell>{" "}
                  <TableCell className="flex justify-center items-center">
                    {(account?.role === "SuperAdmin" ||
                      (account?.role === "Manager" && user.role !== "SuperAdmin")) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Pencil
                            size={20}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpenUpdateUserDialog(true);
                              setSelectedUser(user);
                            }}
                            className="text-gray-600 hover:text-gray-900 mr-6 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>編集</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <UserCreateDialog
        isOpenCreateUserDialog={isOpenCreateUserDialog}
        setIsOpenCreateUserDialog={setIsOpenCreateUserDialog}
        organizationId={organization.id}
      />
      {!!selectedUser && (
        <UserUpdateDialog
          isOpenUpdateUserDialog={isOpenUpdateUserDialog}
          setIsOpenUpdateUserDialog={setIsOpenUpdateUserDialog}
          organizationId={organization.id}
          user={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      )}
    </div>
  );
};
