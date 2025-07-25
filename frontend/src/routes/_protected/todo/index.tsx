import { todoGetListOptions } from "@/client/@tanstack/react-query.gen";
import { Todo } from "@/features/todo";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/todo/")({
  loader: async () => {
    const { account } = useAuthStore.getState();
    if (!account) {
      // _protected.tsxのbeforeLoadで認証チェック済みのため、理論上ここには到達しない
      throw new Error("No Authentication Data");
    }

    // organizationIdが有効な値の場合のみクエリを実行
    if (account.organizationId) {
      await queryClient.ensureQueryData(
        todoGetListOptions({
          path: {
            id: account.organizationId,
          },
        })
      );
    }

    return { account };
  },
  component: () => {
    const { account } = useLoaderData({ from: "/_protected/todo/" });

    // organizationIdが有効な値の場合のみクエリを実行
    const { data: todoList } = account.organizationId
      ? useSuspenseQuery(
          todoGetListOptions({
            path: {
              id: account.organizationId,
            },
          })
        )
      : { data: undefined };

    return <Todo todoList={todoList} />;
  },
});
