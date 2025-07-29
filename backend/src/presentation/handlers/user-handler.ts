import { Account } from "@/domain/account/account.js";
import { UnexpectedError } from "@/errors/errors.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { UserCreateCommand } from "@/usecase/user/command/create.js";
import type { UserDeleteCommand } from "@/usecase/user/command/delete.js";
import type { UserUpdateRoleCommand } from "@/usecase/user/command/update-role.js";
import type { UserUpdateCommand } from "@/usecase/user/command/update.js";
import type { Context } from "hono";

export class UserHandler {
  constructor(
    private readonly userCreateCommand: UserCreateCommand,
    private readonly userUpdateCommand: UserUpdateCommand,
    private readonly userUpdateRoleCommand: UserUpdateRoleCommand,
    private readonly userDeleteCommand: UserDeleteCommand
  ) {}

  async createUser(c: Context) {
    const body = await c.req.json();

    const result = await this.userCreateCommand.execute(
      body.userId,
      body.name,
      body.password,
      body.organizationId,
      body.role,
      c.get("actor")
    );

    if (result.isErr()) {
      c.get("logger").error("UserCreateCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const parsedResponse = schemas.Account.safeParse(result.value);
    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }

    return c.json(result.value, 201);
  }

  async updateUser(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await this.userUpdateCommand.execute(
      id,
      body.userId || undefined,
      body.name || undefined,
      body.password || undefined,
      c.get("actor")
    );

    if (result.isErr()) {
      c.get("logger").error("UserUpdateCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const parsedResponse = schemas.Account.safeParse(result.value);
    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }

    return c.json(result.value);
  }

  async updateUserRole(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await this.userUpdateRoleCommand.execute(id, body.role, c.get("actor"));
    if (result.isErr()) {
      c.get("logger").error("UserUpdateRoleCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const parsedResponse = schemas.Account.safeParse(result.value);
    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }
    return c.json(result.value);
  }

  async deleteUser(c: Context) {
    const id = c.req.param("id");

    const result = await this.userDeleteCommand.execute(id, c.get("actor"));

    if (result.isErr()) {
      c.get("logger").error("UserDeleteCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.body(null, 204);
  }
}
