import type { TodoGetListResponse } from "@/client/types.gen";

export const Todo = ({ todoList }: { todoList?: TodoGetListResponse }) => {
  return (
    <div>
      <div>
        <h1>Todoリスト</h1>
      </div>
      <div>
        {todoList?.list.map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
      </div>
    </div>
  );
};
