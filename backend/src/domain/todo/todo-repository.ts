import type { Result } from "neverthrow";
import type { TodoItem } from "./todo.js";

export interface TodoRepository {
  save(todo: TodoItem, organizationId: string): Promise<Result<TodoItem, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
