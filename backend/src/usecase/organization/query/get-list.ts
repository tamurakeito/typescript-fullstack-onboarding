import type { Role } from "@/domain/account/account.js";
import { Organization } from "@/domain/organization/organization.js";
import { type AppError, NoOrganizationError, UnexpectedError } from "@/errors/errors.js";
import { ForbiddenError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationListQuery {
  execute(role: Role): Promise<Result<Array<Organization>, AppError>>;
}

export class OrganizationListQueryImpl implements OrganizationListQuery {
  private prisma = new PrismaClient();

  async execute(role: Role): Promise<Result<Array<Organization>, AppError>> {
    if (role !== "SuperAdmin") {
      return err(new ForbiddenError());
    }

    const datas = await this.prisma.organization.findMany();
    if (datas.length === 0) {
      return err(new NoOrganizationError());
    }

    const results = datas.map((data) => Organization.create(data.id, data.name));
    const resultError = results.find((results) => results.isErr());
    if (resultError) {
      return err(new UnexpectedError());
    }
    const organizations: Array<Organization> = results.map((result) => result._unsafeUnwrap());

    return ok(organizations);
  }
}
