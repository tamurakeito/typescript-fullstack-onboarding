import { Result } from "neverthrow";
import {TodoItem} from "./todo-item.js";

export interface TodoRepository {
    save(todo: TodoItem): Promise<Result<TodoItem, Error>>;
    delete(id: string): Promise<Result<void, Error>>;
}