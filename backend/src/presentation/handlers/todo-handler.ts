import { Account } from "@/domain/account/account.js";
import { UnexpectedError } from "@/errors/errors.js";
import type { TodoListQuery } from "@/usecase/todo/query/get-list.js";
import type { Context } from "hono";

export class TodoHandler {
  constructor(private readonly todoListQuery: TodoListQuery) {}

  async getTodoList(c: Context) {
    const organizationId = c.req.param("id");
    const actorWithPermissions = c.get("actorWithPermissions");
    const actor = Account.create(
      actorWithPermissions.id,
      actorWithPermissions.userId,
      actorWithPermissions.name,
      actorWithPermissions.hashedPassword,
      actorWithPermissions.organizationId,
      actorWithPermissions.role
    );
    if (actor.isErr()) {
      const error = new UnexpectedError(actor.error.message);
      return c.json({ message: error.message }, error.statusCode);
    }

    const result = await this.todoListQuery.execute(organizationId, actor.value);

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
}
