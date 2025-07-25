import type { AccountRepository } from "@/domain/account/account-repository.js";
import { Account, type Role } from "@/domain/account/account.js";
import type { PasswordHash } from "@/domain/account/password-hash.js";
import type { Actor } from "@/domain/authorization/permission-service.js";
import type { OrganizationRepository } from "@/domain/organization/organization-repository.js";
import {
  type AppError,
  DuplicateUserIdError,
  ForbiddenError,
  UnExistAccountError,
  UnexpectedError,
} from "@/errors/errors.js";
import { type Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";

export interface UserCreateCommand {
  execute(
    userId: string,
    name: string,
    password: string,
    organizationId: string,
    role: Role,
    actor: Actor
  ): Promise<Result<Account, AppError>>;
}

export class UserCreateCommandImpl implements UserCreateCommand {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly passwordHash: PasswordHash
  ) {}

  async execute(
    userId: string,
    name: string,
    password: string,
    organizationId: string,
    role: Role,
    actor: Actor
  ): Promise<Result<Account, AppError>> {
    if (actor.role === "Manager" && actor.organizationId !== organizationId) {
      return err(new ForbiddenError());
    }

    const [accountExist, organizationExist] = await Promise.all([
      this.accountRepository.findByUserId(userId),
      this.organizationRepository.findById(organizationId),
    ]);

    if (accountExist.isErr() && !(accountExist.error instanceof UnExistAccountError)) {
      return err(accountExist.error);
    }
    if (accountExist.isOk()) {
      return err(new DuplicateUserIdError());
    }

    if (organizationExist.isErr()) {
      return err(organizationExist.error);
    }

    const hashedPassword = await this.passwordHash.hash(password);

    const account = Account.create(uuidv4(), userId, name, hashedPassword, organizationId, role);
    if (account.isErr()) {
      return err(new UnexpectedError(account.error.message));
    }

    const result = await this.accountRepository.save(account.value);

    if (result.isErr()) {
      return err(new UnexpectedError(result.error.message));
    }

    return ok(result.value);
  }
}
