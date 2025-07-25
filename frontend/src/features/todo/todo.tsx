import type { TodoGetListResponse } from "@/client/types.gen";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TodoCreateDialog } from "./dialog/create-dialog";

const statusColor = (status?: string) => {
  switch (status) {
    case "NotStarted":
      return "bg-orange-100 text-orange-800";
    case "InProgress":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const TodoList = ({ todoList }: { todoList: TodoGetListResponse }) => {
  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState<boolean>(false);
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="w-full flex justify-between mb-2">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">{todoList?.organizationName}</h1>
          <Button
            onClick={() => {
              setIsOpenCreateDialog(true);
            }}
            className="mt-4"
          >
            新規作成
          </Button>
        </div>
        <div className="flex flex-row gap-4">
          <TodoCulumn
            list={todoList?.list.filter((todo) => todo.status === "NotStarted") ?? []}
            status="未着手"
          />
          <TodoCulumn
            list={todoList?.list.filter((todo) => todo.status === "InProgress") ?? []}
            status="進行中"
          />
          <TodoCulumn
            list={todoList?.list.filter((todo) => todo.status === "Completed") ?? []}
            status="完了"
          />
        </div>
      </div>
      <TodoCreateDialog
        isOpenCreateDialog={isOpenCreateDialog}
        setIsOpenCreateDialog={setIsOpenCreateDialog}
        organizationId={todoList.organizationId}
      />
    </div>
  );
};

const TodoCulumn = ({ list, status }: { list: TodoGetListResponse["list"]; status: string }) => {
  return (
    <div className="w-full">
      <h2 className="text-gray-500 text-l font-bold pl-2 mb-2">{status}</h2>
      <div className="space-y-2 overflow-y-auto pb-2 w-full h-[calc(100vh-180px)]">
        {list.length ? (
          list.map((todo) => (
            <div
              key={todo.id}
              className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg cursor-pointer shadow p-4 border hover:bg-gray-100 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-800">{todo.title}</span>
                </div>
                <div className="mt-1 text-gray-600 text-sm break-words">
                  {todo.description ?? <span className="text-gray-400">説明なし</span>}
                </div>
              </div>
              <div className="mt-3 md:mt-0 md:ml-6 flex-shrink-0">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                    todo.status
                  )}`}
                >
                  {status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-10">タスクはありません</div>
        )}
      </div>
    </div>
  );
};
