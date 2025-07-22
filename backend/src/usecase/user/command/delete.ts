import type { AccountRepository } from "@/domain/account/account-repository.js";
import type { AppError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface UserDeleteCommand {
  execute(id: string): Promise<Result<void, AppError>>;
}

export class UserDeleteCommandImpl implements UserDeleteCommand {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(id: string): Promise<Result<void, AppError>> {
    const result = await this.accountRepository.delete(id);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }
}
