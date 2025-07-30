import type { Result } from "neverthrow";
import type { TodoItem } from "./todo.js";

export interface TodoRepository {
  findById(id: string): Promise<Result<TodoItem, Error>>;
  save(todo: TodoItem): Promise<Result<TodoItem, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
