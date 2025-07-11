import type { AppError } from "@/errors/errors.js";
import type { Result } from "neverthrow";
import type { Organization } from "./organization.js";

export interface OrganizationRepository {
  create(name: string): Promise<Result<Organization, AppError>>;
  update(organization: Organization): Promise<Result<void, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
}
