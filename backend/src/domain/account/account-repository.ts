import type { Result } from "neverthrow";
import type { Account } from "./account.js";

export interface AccountRepository {
  save(account: Account): Promise<Result<Account, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
