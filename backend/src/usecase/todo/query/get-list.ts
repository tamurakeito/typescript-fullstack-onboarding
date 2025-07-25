import type { Actor } from "@/domain/authorization/permission.js";
import { TodoItem, TodoList } from "@/domain/todo/todo.js";
import {
  type AppError,
  ForbiddenError,
  NoOrganizationError,
  NoTodoItemError,
  UnexpectedError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface TodoListQuery {
  execute(organizationId: string, actor: Actor): Promise<Result<TodoList, AppError>>;
}

export class TodoListQueryImpl implements TodoListQuery {
  private prisma = new PrismaClient();

  async execute(organizationId: string, actor: Actor): Promise<Result<TodoList, AppError>> {
    if (
      (actor.role === "Manager" || actor.role === "Operator") &&
      actor.organizationId !== organizationId
    ) {
      return err(new ForbiddenError());
    }

    const organizationWithTodos = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        todos: true,
      },
    });
    if (!organizationWithTodos) {
      return err(new NoOrganizationError());
    }

    const datas = organizationWithTodos.todos;

    if (datas.length === 0) {
      return err(new NoTodoItemError());
    }
    const items = datas.map((data) =>
      TodoItem.create(data.id, data.title, data.description, data.status)
    );

    const validItems: Array<TodoItem> = [];
    for (const item of items) {
      if (item.isErr()) {
        return err(new UnexpectedError());
      }
      validItems.push(item.value);
    }

    const list = TodoList.create(organizationId, organizationWithTodos.name, validItems);
    if (list.isErr()) {
      return err(new UnexpectedError());
    }
    return ok(list.value);
  }
}
