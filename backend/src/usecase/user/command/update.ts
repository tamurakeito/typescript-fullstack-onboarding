import type { AccountRepository } from "@/domain/account/account-repository.js";
import type { Account } from "@/domain/account/account.js";
import type { PasswordHash } from "@/domain/account/password-hash.js";
import {
  DuplicateUserIdError,
  ForbiddenError,
  UnExistAccountError,
  UnexpectedError,
} from "@/errors/errors.js";
import type { AppError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

export interface UserUpdateCommand {
  execute(
    id: string,
    userId: string | undefined,
    name: string | undefined,
    password: string | undefined,
    actor: Account
  ): Promise<Result<Account, AppError>>;
}

export class UserUpdateCommandImpl implements UserUpdateCommand {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHash: PasswordHash
  ) {}

  async execute(
    id: string,
    userId: string | undefined,
    name: string | undefined,
    password: string | undefined,
    actor: Account
  ): Promise<Result<Account, AppError>> {
    if ((actor.role === "Manager" || actor.role === "Operator") && actor.id !== id) {
      return err(new ForbiddenError());
    }

    const account = await this.accountRepository.findById(id);
    if (account.isErr()) {
      return err(account.error);
    }

    if (userId) {
      const userIdExist = await this.accountRepository.findByUserId(userId);
      if (userIdExist.isErr() && !(userIdExist.error instanceof UnExistAccountError)) {
        return err(userIdExist.error);
      }
      if (userIdExist.isOk()) {
        return err(new DuplicateUserIdError());
      }
    }

    const hashedPassword = password ? await this.passwordHash.hash(password) : undefined;

    const updatedAccount = account.value.update(userId, name, hashedPassword, undefined, undefined);

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
