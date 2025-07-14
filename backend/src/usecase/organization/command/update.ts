import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { Organization } from "@/domain/organization/organization.js";
import { type AppError, UnExistOrganizationError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationUpdateCommand {
  execute(id: string, name: string): Promise<Result<Organization, AppError>>;
}

export class OrganizationUpdateCommandImpl implements OrganizationUpdateCommand {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  private prisma = new PrismaClient();

  async execute(id: string, name: string): Promise<Result<Organization, AppError>> {
    const uniqValidate = await this.prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!uniqValidate) {
      return err(new UnExistOrganizationError());
    }

    const result = await this.organizationRepository.save({ id, name });
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(result.value);
  }
}
