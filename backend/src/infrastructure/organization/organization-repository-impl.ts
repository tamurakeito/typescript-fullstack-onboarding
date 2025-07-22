import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import { Organization } from "@/domain/organization/organization.js";
import {
  type AppError,
  DuplicateOrganizationNameError,
  UnExistOrganizationError,
  UnexpectedError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library.js";
import { type Result, err, ok } from "neverthrow";

export class OrganizationRepositoryImpl implements OrganizationRepository {
  private prisma = new PrismaClient();

  async findById(id: string): Promise<Result<Organization, AppError>> {
    try {
      const result = await this.prisma.organization.findUnique({ where: { id } });

      if (!result) {
        return err(new UnExistOrganizationError());
      }

      const data = Organization.create(result.id, result.name);

      if (data.isErr()) {
        return err(new UnexpectedError(data.error.message));
      }

      return ok(data.value);
    } catch {
      return err(new UnexpectedError());
    }
  }

  async save(organization: Organization): Promise<Result<Organization, AppError>> {
    try {
      const result = await this.prisma.organization.upsert({
        where: { id: organization.id },
        update: { name: organization.name },
        create: { id: organization.id, name: organization.name },
      });
      return ok(result);
    } catch (error) {
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
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2001":
            return err(new UnExistOrganizationError());
          default:
            return err(new UnexpectedError());
        }
      }
      return err(new UnexpectedError());
    }
  }
}
