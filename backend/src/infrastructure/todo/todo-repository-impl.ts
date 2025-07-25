import type { TodoRepository } from "@/domain/todo/todo-repository.js";
import { TodoItem } from "@/domain/todo/todo.js";
import { UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export class TodoRepositoryImpl implements TodoRepository {
  private prisma = new PrismaClient();

  async save(todo: TodoItem, organizationId: string): Promise<Result<TodoItem, Error>> {
    try {
      const result = await this.prisma.todo.upsert({
        where: { id: todo.id },
        update: {
          title: todo.title,
          description: todo.description,
          status: todo.status,
        },
        create: {
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          organizationId: organizationId,
        },
      });

      if (!result) {
        return err(new UnexpectedError());
      }

      const data = TodoItem.create(result.id, result.title, result.description, result.status);

      if (data.isErr()) {
        return err(new UnexpectedError(data.error.message));
      }

      return ok(data.value);
    } catch {
      return err(new UnexpectedError());
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.prisma.todo.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new UnexpectedError());
    }
  }
}
