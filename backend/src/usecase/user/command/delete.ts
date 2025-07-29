import type { AccountRepository } from "@/domain/account/account-repository.js";
import type { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { type AppError, ForbiddenError } from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";

export interface UserDeleteCommand {
  execute(id: string, actor: Actor): Promise<Result<void, AppError>>;
}

export class UserDeleteCommandImpl implements UserDeleteCommand {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(id: string, actor: Actor): Promise<Result<void, AppError>> {
    const account = await this.accountRepository.findById(id);
    if (account.isErr()) {
      return err(account.error);
    }

    if (actor.role === "Manager" && actor.organizationId !== account.value.organizationId) {
      return err(new ForbiddenError());
    }

    const result = await this.accountRepository.delete(id);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }
}
