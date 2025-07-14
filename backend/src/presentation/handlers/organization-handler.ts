import { BadRequestError } from "@/errors/errors.js";
import type { OrganizationCreateCommand } from "@/usecase/organization/command/create.js";
import type { OrganizationDeleteCommand } from "@/usecase/organization/command/delete.js";
import type { OrganizationUpdateCommand } from "@/usecase/organization/command/update.js";
import type { OrganizationListQuery } from "@/usecase/organization/query/get-list.js";
import type { Context } from "hono";
import { z } from "zod";

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

    return c.json(result.value, 200);
  }

  async createOrganization(c: Context) {
    const body = await c.req.json();
    const parsedBody = z
      .object({
        name: z.string(),
      })
      .safeParse(body);

    if (!parsedBody.success) {
      const error = new BadRequestError();
      return c.json({ message: error.message }, error.statusCode);
    }

    const result = await this.organizationCreateCommand.execute(parsedBody.data.name);

    if (result.isErr()) {
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.json(result.value, 201);
  }

  async updateOrganization(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsedBody = z
      .object({
        name: z.string(),
      })
      .safeParse(body);

    if (!parsedBody.success) {
      const error = new BadRequestError();
      return c.json({ message: error.message }, error.statusCode);
    }

    const result = await this.organizationUpdateCommand.execute(id, parsedBody.data.name);

    if (result.isErr()) {
      return c.json({ message: result.error.message }, result.error.statusCode);
    }

    return c.json(result.value, 200);
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
