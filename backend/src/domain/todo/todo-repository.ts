import { Result } from "neverthrow";
import { type TodoStatus } from "./todo-item.js";

export interface TodoRepository {
    create(title: string, description: string, organizationId: string): Promise<Result<void, Error>>;
    updateTitle(id: string, title: string): Promise<Result<void, Error>>;
    updateDescription(id: string, description: string): Promise<Result<void, Error>>;
    updateStatus(id: string, status: TodoStatus): Promise<Result<void, Error>>;
    delete(id: string): Promise<Result<void, Error>>;
}