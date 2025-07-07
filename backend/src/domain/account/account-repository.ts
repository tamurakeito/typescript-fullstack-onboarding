import { Result } from "neverthrow";
import { Account } from "./account.js";

export interface AccountRepository {
  save(account: Account): Promise<Result<Account, Error>>;
  delete(id: number): Promise<Result<void, Error>>;
}
