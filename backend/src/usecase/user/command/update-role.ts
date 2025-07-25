import type { AccountRepository } from "@/domain/account/account-repository.js";
import type { Account, Role } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission-service.js";
import { ForbiddenError, UnexpectedError } from "@/errors/errors.js";
import type { AppError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

export interface UserUpdateRoleCommand {
  execute(id: string, role: Role, actor: Actor): Promise<Result<Account, AppError>>;
}

export class UserUpdateRoleCommandImpl implements UserUpdateRoleCommand {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(id: string, role: Role, actor: Actor): Promise<Result<Account, AppError>> {
    const account = await this.accountRepository.findById(id);
    if (account.isErr()) {
      return err(account.error);
    }

    if (
      actor.role === "Manager" &&
      (actor.organizationId !== account.value.organizationId ||
        account.value.role === "SuperAdmin" ||
        role === "SuperAdmin")
    ) {
      return err(new ForbiddenError());
    }

    const updatedAccount = account.value.update(undefined, undefined, undefined, undefined, role);

    if (updatedAccount.isErr()) {
      return err(new UnexpectedError(updatedAccount.error.message));
    }

    const result = await this.accountRepository.save(updatedAccount.value);

    if (result.isErr()) {
      return err(new UnexpectedError(result.error.message));
    }

    return ok(result.value);
  }
}
