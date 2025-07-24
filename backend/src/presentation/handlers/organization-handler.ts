import { Account } from "@/domain/account/account.js";
import { UnexpectedError } from "@/errors/errors.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { OrganizationCreateCommand } from "@/usecase/organization/command/create.js";
import type { OrganizationDeleteCommand } from "@/usecase/organization/command/delete.js";
import type { OrganizationUpdateCommand } from "@/usecase/organization/command/update.js";
import type { OrganizationListQuery } from "@/usecase/organization/query/get-list.js";
import type { OrganizationProfileQuery } from "@/usecase/organization/query/get-profile.js";
import type { Context } from "hono";

export class OrganizationHandler {
  constructor(
    private readonly organizationListQuery: OrganizationListQuery,
    private readonly organizationProfileQuery: OrganizationProfileQuery,
    private readonly organizationCreateCommand: OrganizationCreateCommand,
    private readonly organizationUpdateCommand: OrganizationUpdateCommand,
    private readonly organizationDeleteCommand: OrganizationDeleteCommand
  ) {}

  async getOrganizationList(c: Context) {
    const result = await this.organizationListQuery.execute();

    if (result.isErr()) {
      c.get("logger").error("OrganizationListQuery failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    for (const data of result.value) {
      const parsedResponse = schemas.Organization.safeParse(data);
      if (parsedResponse.error) {
        c.get("logger").error(parsedResponse.error.errors);
      }
    }

    return c.json(result.value, 200);
  }

  async getOrganizationProfile(c: Context) {
    const id = c.req.param("id");
    const accountWithPermissions = c.get("accountWithPermissions");
    const account = Account.create(
      accountWithPermissions.id,
      accountWithPermissions.userId,
      accountWithPermissions.name,
      accountWithPermissions.hashedPassword,
      accountWithPermissions.organizationId,
      accountWithPermissions.role
    );
    if (account.isErr()) {
      const error = new UnexpectedError(account.error.message);
      return c.json({ message: error.message }, error.statusCode);
    }
    const result = await this.organizationProfileQuery.execute(id, account.value);

    if (result.isErr()) {
      c.get("logger").error("OrganizationProfileQuery failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const parsedResponse = schemas.OrganizationProfile.safeParse(result.value);
    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }

    return c.json(result.value, 200);
  }

  async createOrganization(c: Context) {
    const body = await c.req.json();

    const result = await this.organizationCreateCommand.execute(body.name);

    if (result.isErr()) {
      c.get("logger").error("OrganizationCreateCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const parsedResponse = schemas.Organization.safeParse(result.value);
    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }

    return c.json(result.value, 201);
  }

  async updateOrganization(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await this.organizationUpdateCommand.execute(id, body.name);

    if (result.isErr()) {
      c.get("logger").error("OrganizationUpdateCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const parsedResponse = schemas.Organization.safeParse(result.value);
    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }

    return c.json(result.value, 200);
  }

  async deleteOrganization(c: Context) {
    const id = c.req.param("id");
    const result = await this.organizationDeleteCommand.execute(id);

    if (result.isErr()) {
      c.get("logger").error("OrganizationDeleteCommand failed", {
        error: result.error.constructor.name,
        message: result.error.message,
        statusCode: result.error.statusCode,
      });
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.body(null, 204);
  }
}
