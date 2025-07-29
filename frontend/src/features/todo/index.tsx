import type { OrganizationApiGetListResponse } from "@/client/types.gen";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";

export const TodoOrganizationList = ({
  organizationList,
}: { organizationList: OrganizationApiGetListResponse }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todoリスト</h1>
          <p className="text-gray-600">登録されている組織一覧</p>
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
                  onClick={() => navigate({ to: `/${org.id}/todo-list` })}
                >
                  <TableCell className="font-medium">{org.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
