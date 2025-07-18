import type { OrganizationIdCheck } from "@/domain/organization/organization-id-check.js";
import { type AppError, UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/client.js";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export class OrganizationIdCheckImpl implements OrganizationIdCheck {
  private prisma = new PrismaClient();

  async execute(organizationId: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.prisma.organization.findUnique({
        where: {
          id: organizationId,
        },
      });

      return ok(result !== null);
    } catch {
      return err(new UnexpectedError());
    }
  }
}
