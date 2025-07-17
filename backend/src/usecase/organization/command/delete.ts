import type { Role } from "@/domain/account/account.js";
import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import { type AppError, ForbiddenError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface OrganizationDeleteCommand {
  execute(id: string, clientRole: Role): Promise<Result<void, AppError>>;
}

export class OrganizationDeleteCommandImpl implements OrganizationDeleteCommand {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(id: string, clientRole: Role): Promise<Result<void, AppError>> {
    if (clientRole !== "SuperAdmin") {
      return err(new ForbiddenError());
    }

    const result = await this.organizationRepository.delete(id);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }
}
