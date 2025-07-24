import type { Account, Role } from "@/domain/account/account.js";
import type { AppError } from "@/errors/errors.js";
import type { Result } from "neverthrow";

export type Permission = string;

export type Actor = Account & {
  permissions: Array<Permission>;
};
export type Action = "create" | "read" | "update" | "delete" | "readAll";
export type Resource = "Account" | "Organization" | "Todo";

export interface PermissionService {
  getPermission(role: Role): Promise<Result<Array<Permission>, AppError>>;
}
