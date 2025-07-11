import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { AppError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationUpdateCommand {
  execute(id: string, name: string): Promise<Result<void, AppError>>;
}

export class OrganizationUpdateCommandImpl implements OrganizationUpdateCommand {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(id: string, name: string): Promise<Result<void, AppError>> {
    const organization = await this.organizationRepository.save({ id, name });
    if (organization.isErr()) {
      return err(organization.error);
    }
    return ok(undefined);
  }
}
