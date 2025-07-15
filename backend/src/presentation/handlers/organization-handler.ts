import type { Organization } from "@/domain/organization/organization.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { OrganizationCreateCommand } from "@/usecase/organization/command/create.js";
import type { OrganizationDeleteCommand } from "@/usecase/organization/command/delete.js";
import type { OrganizationUpdateCommand } from "@/usecase/organization/command/update.js";
import type { OrganizationListQuery } from "@/usecase/organization/query/get-list.js";
import type { Context } from "hono";

export class OrganizationHandler {
  constructor(
    private readonly organizationListQuery: OrganizationListQuery,
    private readonly organizationCreateCommand: OrganizationCreateCommand,
    private readonly organizationUpdateCommand: OrganizationUpdateCommand,
    private readonly organizationDeleteCommand: OrganizationDeleteCommand
  ) {}

  async getOrganizationList(c: Context) {
    const result = await this.organizationListQuery.execute();

    if (result.isErr()) {
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const response: Array<Organization> = [];
    for (const data of result.value) {
      response.push(schemas.Organization.parse(data));
    }

    return c.json(response, 200);
  }

  async createOrganization(c: Context) {
    const body = await c.req.json();

    const result = await this.organizationCreateCommand.execute(body.name);

    if (result.isErr()) {
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const response = schemas.Organization.parse(result.value);

    return c.json(response, 201);
  }

  async updateOrganization(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await this.organizationUpdateCommand.execute(id, body.name);

    if (result.isErr()) {
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    const response = schemas.Organization.parse(result.value);

    return c.json(response, 200);
  }

  async deleteOrganization(c: Context) {
    const id = c.req.param("id");
    const result = await this.organizationDeleteCommand.execute(id);

    if (result.isErr()) {
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.body(null, 204);
  }
}
