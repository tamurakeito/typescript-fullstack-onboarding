import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { Organization } from "@/domain/organization/organization.js";
import type { AppError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";

export interface OrganizationCreateCommand {
  execute(name: string): Promise<Result<Organization, AppError>>;
}

export class OrganizationCreateCommandImpl implements OrganizationCreateCommand {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(name: string): Promise<Result<Organization, AppError>> {
    const data: Organization = {
      id: uuidv4(),
      name,
    };
    const organization = await this.organizationRepository.save(data);
    if (organization.isErr()) {
      return err(organization.error);
    }
    return ok(organization.value);
  }
}
