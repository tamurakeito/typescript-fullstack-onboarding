import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { AppError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationDeleteCommand {
  execute(id: string): Promise<Result<void, AppError>>;
}

export class OrganizationDeleteCommandImpl implements OrganizationDeleteCommand {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(id: string): Promise<Result<void, AppError>> {
    const result = await this.organizationRepository.delete(id);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }
}
