import type { Result } from "neverthrow";

import type { AppError } from "@/errors/errors.js";

export interface OrganizationIdCheck {
  execute(organizationId: string): Promise<Result<boolean, AppError>>;
}
