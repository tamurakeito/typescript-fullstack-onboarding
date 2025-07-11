import type { Organization } from "@/domain/organization/organization.js";
import type { AppError } from "@/errors/errors.js";
import type { Result } from "neverthrow";

// 組織一覧の取得

export interface OrganizationQuery {
  execute(organizationId: string): Promise<Result<Organization, AppError>>;
}
