import type { Result } from "neverthrow";
import type { TodoItem } from "./todo.js";

export interface TodoRepository {
  findById(id: string): Promise<Result<{ todo: TodoItem; organizationId: string }, Error>>;
  save(todo: TodoItem, organizationId: string): Promise<Result<TodoItem, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
