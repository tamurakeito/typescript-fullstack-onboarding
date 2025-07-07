import type { Result } from "neverthrow";
import type { Organization } from "./organization.js";

export interface OrganizationRepository {
  save(organization: Organization): Promise<Result<Organization, Error>>;
  delete(id: number): Promise<Result<void, Error>>;
}
