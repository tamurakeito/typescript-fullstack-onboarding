import type { Account } from "@/domain/account/account.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { UserCreateCommand } from "@/usecase/user/command/create.js";
import type { UserUpdateRoleCommand } from "@/usecase/user/command/update-role.js";
import type { Context } from "hono";

export class UserHandler {
  constructor(
    private readonly userCreateCommand: UserCreateCommand,
    private readonly userUpdateRoleCommand: UserUpdateRoleCommand
  ) {}

  async createUser(c: Context) {
    const body = await c.req.json();

    const result = await this.userCreateCommand.execute(
      body.userId,
      body.name,
      body.password,
      body.organizationId,
      body.role
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

  async updateUserRole(c: Context) {
    const account = c.get("account");
    const body = await c.req.json();

    const result = await this.userUpdateRoleCommand.execute(account, body.role);

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
}
