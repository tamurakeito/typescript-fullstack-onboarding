import { Result } from "neverthrow";
import { Organization } from "./organization.js";

export interface OrganizationRepository {
  save(organization: Organization): Promise<Result<Organization, Error>>;
  delete(id: number): Promise<Result<void, Error>>;
}
