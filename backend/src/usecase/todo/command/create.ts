import type { Actor } from "@/domain/authorization/permission.js";
import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { TodoRepository } from "@/domain/todo/todo-repository.js";
import type { TodoItem } from "@/domain/todo/todo.js";
import {
  type AppError,
  ForbiddenError,
  UnExistOrganizationError,
  UnexpectedError,
} from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";

export interface TodoCreateCommand {
  execute(
    title: string,
    description: string,
    organizationId: string,
    actor: Actor
  ): Promise<Result<TodoItem, AppError>>;
}

export class TodoCreateCommandImpl implements TodoCreateCommand {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async execute(
    title: string,
    description: string,
    organizationId: string,
    actor: Actor
  ): Promise<Result<TodoItem, AppError>> {
    if (
      (actor.role === "Manager" || actor.role === "Operator") &&
      actor.organizationId !== organizationId
    ) {
      return err(new ForbiddenError());
    }

    const organization = await this.organizationRepository.findById(organizationId);

    if (organization.isErr()) {
      return err(new UnExistOrganizationError());
    }

    const todoItem: TodoItem = {
      id: uuidv4(),
      title: title,
      description: description,
      status: "NotStarted",
    };

    const result = await this.todoRepository.save(todoItem, organizationId);

    if (result.isErr()) {
      return err(new UnexpectedError(result.error.message));
    }

    return ok(result.value);
  }
}
