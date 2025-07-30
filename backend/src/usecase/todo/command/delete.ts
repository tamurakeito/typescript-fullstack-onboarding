import type { Actor } from "@/domain/authorization/permission.js";
import type { TodoRepository } from "@/domain/todo/todo-repository.js";
import type { TodoItem } from "@/domain/todo/todo.js";
import {
  type AppError,
  ForbiddenError,
  UnExistTodoError,
  UnexpectedError,
} from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface TodoDeleteCommand {
  execute(id: string, actor: Actor): Promise<Result<void, AppError>>;
}

export class TodoDeleteCommandImpl implements TodoDeleteCommand {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string, actor: Actor): Promise<Result<void, AppError>> {
    const todo = await this.todoRepository.findById(id);
    if (todo.isErr()) {
      return err(new UnExistTodoError());
    }

    console.log(actor);
    console.log(todo.value);
    if (
      (actor.role === "Manager" || actor.role === "Operator") &&
      actor.organizationId !== todo.value.organizationId
    ) {
      return err(new ForbiddenError());
    }

    const result = await this.todoRepository.delete(id);
    if (result.isErr()) {
      return err(new UnexpectedError());
    }
    return ok(undefined);
  }
}
