import type { AppError } from "@/errors/errors.js";
import type { Result } from "neverthrow";

export interface UserIdCheck {
  execute(userId: string): Promise<Result<boolean, AppError>>;
}
