import type { Result } from "neverthrow";
import type { TodoItem } from "./todo-item.js";

export interface TodoRepository {
  save(todo: TodoItem): Promise<Result<TodoItem, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
