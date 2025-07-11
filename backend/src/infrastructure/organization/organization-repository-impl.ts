import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { Organization } from "@/domain/organization/organization.js";
import { type AppError, DuplicateOrganizationNameError, UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library.js";
import { type Result, err, ok } from "neverthrow";

export class OrganizationRepositoryImpl implements OrganizationRepository {
  private prisma = new PrismaClient();

  async save(organization: Organization): Promise<Result<Organization, AppError>> {
    try {
      const result = await this.prisma.organization.upsert({
        where: { id: organization.id },
        update: organization,
        create: organization,
      });
      return ok(result);
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            return err(new DuplicateOrganizationNameError());
          default:
            return err(new UnexpectedError());
        }
      }
      return err(new UnexpectedError());
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await this.prisma.organization.delete({ where: { id } });
      return ok(undefined);
    } catch (error) {
      console.log(error);
      return err(new UnexpectedError());
    }
  }
}
