import type { AccountRepository } from "@/domain/account/account-repository.js";
import { Account, type Role } from "@/domain/account/account.js";
import type { PasswordHash } from "@/domain/account/password-hash.js";
import {
  type AppError,
  DuplicateUserIdError,
  UnExistOrganizationError,
  UnexpectedError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";
import { v4 as uuidv4 } from "uuid";

export interface UserCreateCommand {
  execute(
    userId: string,
    name: string,
    password: string,
    organizationId: string,
    role: Role
  ): Promise<Result<Account, AppError>>;
}

export class UserCreateCommandImpl implements UserCreateCommand {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHash: PasswordHash
  ) {}

  private prisma = new PrismaClient();

  async execute(
    userId: string,
    name: string,
    password: string,
    organizationId: string,
    role: Role
  ): Promise<Result<Account, AppError>> {
    const [uniqValidate, existValidate] = await Promise.all([
      this.prisma.account.findUnique({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      }),
      this.prisma.organization.findUnique({
        where: {
          id: organizationId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (uniqValidate) {
      return err(new DuplicateUserIdError());
    }

    if (!existValidate) {
      return err(new UnExistOrganizationError());
    }

    const account = Account.create(uuidv4(), userId, name, organizationId, role);
    if (account.isErr()) {
      return err(new UnexpectedError(account.error.message));
    }

    const hashedPassword = await this.passwordHash.hash(password);

    const result = await this.accountRepository.save(account.value, hashedPassword);

    if (result.isErr()) {
      return err(new UnexpectedError(result.error.message));
    }

    return ok(result.value);
  }
}

import type { AccountRepository } from "@/domain/account/account-repository.js";
import { Account, type Role } from "@/domain/account/account.js";
import type { PasswordHash } from "@/domain/account/password-hash.js";
import type { UserIdCheck } from "@/domain/account/user-id-check.js";
import type { OrganizationIdCheck } from "@/domain/organization/organization-id-check.js";
import {
  type AppError,
  DuplicateUserIdError,
  UnExistOrganizationError,
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
    role: Role
  ): Promise<Result<Account, AppError>>;
}

export class UserCreateCommandImpl implements UserCreateCommand {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHash: PasswordHash,
    private readonly userIdCheck: UserIdCheck,
    private readonly organizationIdCheck: OrganizationIdCheck
  ) {}

  async execute(
    userId: string,
    name: string,
    password: string,
    organizationId: string,
    role: Role
  ): Promise<Result<Account, AppError>> {
    const [userIdExist, organizationExist] = await Promise.all([
      this.userIdCheck.execute(userId),
      this.organizationIdCheck.execute(organizationId),
    ]);

    if (userIdExist.isErr()) {
      return err(userIdExist.error);
    }
    if (userIdExist.value) {
      return err(new DuplicateUserIdError());
    }

    if (organizationExist.isErr()) {
      return err(organizationExist.error);
    }
    if (!organizationExist.value) {
      return err(new UnExistOrganizationError());
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
