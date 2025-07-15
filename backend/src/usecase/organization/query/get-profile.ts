import { OrganizationProfile, type User } from "@/domain/organization/organization.js";
import { type AppError, UnExistUserError, UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationProfileQuery {
  execute(id: string): Promise<Result<OrganizationProfile, AppError>>;
}

export class OrganizationProfileQueryImpl implements OrganizationProfileQuery {
  private prisma = new PrismaClient();

  async execute(id: string): Promise<Result<OrganizationProfile, AppError>> {
    const organizationData = await this.prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organizationData) {
      return err(new UnExistUserError());
    }
    const usersData = await this.prisma.account.findMany({
      where: {
        organizationId: id,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    const users = usersData.map((user: User) => ({
      id: user.id,
      name: user.name,
      role: user.role,
    }));

    const organizationProfile = OrganizationProfile.createProfile(
      organizationData?.id,
      organizationData?.name,
      users
    );

    if (organizationProfile.isErr()) {
      return err(new UnexpectedError(organizationProfile.error.message));
    }
    return ok(organizationProfile.value);
  }
}
