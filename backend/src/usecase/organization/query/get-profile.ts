import type { Role } from "@/domain/account/account.js";
import { type AppError, ForbiddenError, UnExistUserError } from "@/errors/errors.js";
import type { schemas } from "@/generated/client/client.gen.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";
import type { z } from "zod";

export interface OrganizationProfileQuery {
  execute(
    id: string,
    clientRole: Role,
    clientOrganizationId: string
  ): Promise<Result<z.infer<typeof schemas.OrganizationProfile>, AppError>>;
}

export class OrganizationProfileQueryImpl implements OrganizationProfileQuery {
  private prisma = new PrismaClient();

  async execute(
    id: string,
    clientRole: Role,
    clientOrganizationId: string
  ): Promise<Result<z.infer<typeof schemas.OrganizationProfile>, AppError>> {
    if (clientRole !== "SuperAdmin" && clientOrganizationId !== id) {
      return err(new ForbiddenError());
    }

    const organizationData = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        accounts: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!organizationData) {
      return err(new UnExistUserError());
    }

    const users = organizationData.accounts.map((user) => ({
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    }));

    const organizationProfile = {
      id: organizationData.id,
      name: organizationData.name,
      users,
    };

    return ok(organizationProfile);
  }
}
