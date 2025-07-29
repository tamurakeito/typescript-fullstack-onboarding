import { todoGetListOptions } from "@/client/@tanstack/react-query.gen";
import { TodoList } from "@/features/todo/todo";
import { queryClient } from "@/lib/query-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/todo/$organizationId")({
  loader: async ({ params }) => {
    const { organizationId } = params;
    await queryClient.ensureQueryData(
      todoGetListOptions({
        path: {
          organizationId,
        },
      })
    );
  },
  component: () => {
    const { organizationId } = useParams({ from: "/_protected/todo/$organizationId" });
    const { data: todoList } = useSuspenseQuery(
      todoGetListOptions({
        path: {
          organizationId,
        },
      })
    );
    return <TodoList todoList={todoList} />;
  },
});
