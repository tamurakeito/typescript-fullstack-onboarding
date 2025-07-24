import type { Account, Role } from "@/domain/account/account.js";
import { type AppError, UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export type Permission = string;

export type Action = "create" | "read" | "update" | "delete" | "readAll";
export type Resource = "Account" | "Organization";

export interface PermissionService {
  getPermission(role: Role): Promise<Result<Array<Permission>, AppError>>;
  hasPermission(actor: Account, action: Action, resource: Resource): Promise<boolean>;
}

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

  async hasPermission(actor: Account, action: Action, resource: Resource): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { name: actor.role },
    });
    if (!role) return false;

    const permission = await this.prisma.permission.findUnique({
      where: { name: `${action}:${resource}` },
    });
    if (!permission) return false;

    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
    });

    return !!rolePermission;
  }
}
