import type { TodoCreateCommand } from "@/usecase/todo/command/create.js";
import type { TodoListQuery } from "@/usecase/todo/query/get-list.js";
import type { Context } from "hono";

export class TodoHandler {
  constructor(
    private readonly todoListQuery: TodoListQuery,
    private readonly todoCreateCommand: TodoCreateCommand
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
}
