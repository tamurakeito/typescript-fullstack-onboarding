import type { AppError } from "@/errors/errors.js";
import type { Result } from "neverthrow";
import type { Organization } from "./organization.js";

export interface OrganizationRepository {
  findById(id: string): Promise<Result<Organization | null, AppError>>;
  save(organization: Organization): Promise<Result<Organization, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
}
