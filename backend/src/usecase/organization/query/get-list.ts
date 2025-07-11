import type { Organization } from "@/domain/organization/organization.js";
import { type AppError, NoOrganizationError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationListQuery {
  execute(): Promise<Result<Organization[], AppError>>;
}

export class OrganizationListQueryImpl implements OrganizationListQuery {
  private prisma = new PrismaClient();

  async execute(): Promise<Result<Organization[], AppError>> {
    const organizations = await this.prisma.organization.findMany();
    if (organizations.length === 0) {
      return err(new NoOrganizationError());
    }
    return ok(organizations);
  }
}
