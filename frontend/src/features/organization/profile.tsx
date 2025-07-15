import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const OrganizationProfile = () => {
  const organization = {
    id: "e3fa477b-333b-452c-8528-7ac7742c29fb",
    name: "株式会社テックソリューション",
    users: [
      {
        id: "e3fa477b-333b-452c-8528-7ac7742c29fb",
        userId: "sato-toru",
        name: "佐藤　透",
        role: "Manager",
      },
      {
        id: "a1b2c3d4-5678-9101-1121-314151617181",
        userId: "tanaka-haruka",
        name: "田中　はるか",
        role: "Member",
      },
      {
        id: "b2c3d4e5-6789-1011-1213-141516171819",
        userId: "yamada-ken",
        name: "山田　健",
        role: "Admin",
      },
      {
        id: "c3d4e5f6-7891-0111-2131-415161718192",
        userId: "suzuki-mio",
        name: "鈴木　美緒",
        role: "Member",
      },
      {
        id: "d4e5f6g7-8910-1112-1314-151617181920",
        userId: "kobayashi-ryota",
        name: "小林　亮太",
        role: "Member",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
          <p className="text-gray-600">登録されているユーザー</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-l font-semibold text-gray-900">ユーザー</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>名前</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.userId}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
