import type { Role } from "@/domain/account/account.js";
import type { Permission } from "@/domain/authorization/permission-service.js";
import type { PermissionService } from "@/domain/authorization/permission-service.js";
import { type AppError, UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export class PermissionServiceImpl implements PermissionService {
  private prisma = new PrismaClient();

  async getPermission(role: Role): Promise<Result<Array<Permission>, AppError>> {
    const roleData = await this.prisma.role.findUnique({
      where: { name: role },
    });
    if (!roleData) return err(new UnexpectedError("Role not found"));

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: roleData.id },
      include: {
        permission: true,
      },
    });
    return ok(rolePermissions.map((rp) => rp.permission.name as Permission));
  }
}
