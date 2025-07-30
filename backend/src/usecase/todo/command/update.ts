import type { Actor } from "@/domain/authorization/permission.js";
import type { TodoRepository } from "@/domain/todo/todo-repository.js";
import { TodoItem, type TodoStatus } from "@/domain/todo/todo.js";
import {
  type AppError,
  ForbiddenError,
  UnExistTodoError,
  UnexpectedError,
} from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface TodoUpdateCommand {
  execute(
    id: string,
    title: string,
    description: string,
    status: TodoStatus,
    actor: Actor
  ): Promise<Result<TodoItem, AppError>>;
}

export class TodoUpdateCommandImpl implements TodoUpdateCommand {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(
    id: string,
    title: string,
    description: string,
    status: TodoStatus,
    actor: Actor
  ): Promise<Result<TodoItem, AppError>> {
    const todo = await this.todoRepository.findById(id);

    if (todo.isErr()) {
      return err(new UnExistTodoError());
    }

    if (
      (actor.role === "Manager" || actor.role === "Operator") &&
      actor.organizationId !== todo.value.organizationId
    ) {
      return err(new ForbiddenError());
    }

    const updatedTodoItem = TodoItem.create(
      id,
      title,
      description,
      status,
      todo.value.organizationId
    );

    if (updatedTodoItem.isErr()) {
      return err(new UnexpectedError());
    }

    const result = await this.todoRepository.save(updatedTodoItem.value);

    if (result.isErr()) {
      return err(new UnexpectedError());
    }

    return ok(result.value);
  }
}
