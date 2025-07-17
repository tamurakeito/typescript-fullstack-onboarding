import type { Role } from "@/domain/account/account.js";
import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import type { Organization } from "@/domain/organization/organization.js";
import { type AppError, ForbiddenError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";

export interface OrganizationCreateCommand {
  execute(name: string, clientRole: Role): Promise<Result<Organization, AppError>>;
}

export class OrganizationCreateCommandImpl implements OrganizationCreateCommand {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(name: string, clientRole: Role): Promise<Result<Organization, AppError>> {
    if (clientRole !== "SuperAdmin") {
      return err(new ForbiddenError());
    }

    const data: Organization = {
      id: uuidv4(),
      name,
    };
    const result = await this.organizationRepository.save(data);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(result.value);
  }
}
