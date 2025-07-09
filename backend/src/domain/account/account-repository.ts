import type { AppError } from "@/errors/errors.js";
import type { Result } from "neverthrow";
import type { Account } from "./account.js";

export interface AccountRepository {
  save(account: Account): Promise<Result<Account, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
}
