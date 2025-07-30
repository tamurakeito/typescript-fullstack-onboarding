import type { TodoCreateCommand } from "@/usecase/todo/command/create.js";
import type { TodoDeleteCommand } from "@/usecase/todo/command/delete.js";
import type { TodoUpdateCommand } from "@/usecase/todo/command/update.js";
import type { TodoListQuery } from "@/usecase/todo/query/get-list.js";
import type { Context } from "hono";

export class TodoHandler {
  constructor(
    private readonly todoListQuery: TodoListQuery,
    private readonly todoCreateCommand: TodoCreateCommand,
    private readonly todoUpdateCommand: TodoUpdateCommand,
    private readonly todoDeleteCommand: TodoDeleteCommand
  ) {}

  async getTodoList(c: Context) {
    const organizationId = c.req.param("organizationId");

    const result = await this.todoListQuery.execute(organizationId, c.get("actor"));

    if (result.isErr()) {
      c.get("logger").error("TodoListQuery failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.json(result.value, 200);
  }

  async createTodo(c: Context) {
    const body = await c.req.json();
    const result = await this.todoCreateCommand.execute(
      body.title,
      body.description,
      body.organizationId,
      c.get("actor")
    );

    if (result.isErr()) {
      c.get("logger").error("TodoCreateCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.json(result.value, 201);
  }

  async updateTodo(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();
    const result = await this.todoUpdateCommand.execute(
      id,
      body.title,
      body.description,
      body.status,
      c.get("actor")
    );

    if (result.isErr()) {
      c.get("logger").error("TodoCreateCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.json(result.value, 201);
  }

  async deleteTodo(c: Context) {
    const id = c.req.param("id");
    const result = await this.todoDeleteCommand.execute(id, c.get("actor"));

    if (result.isErr()) {
      c.get("logger").error("TodoDeleteCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.body(null, 204);
  }
}
