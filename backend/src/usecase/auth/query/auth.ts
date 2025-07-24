import { Account, type Role } from "@/domain/account/account.js";
import type { PasswordHash } from "@/domain/account/password-hash.js";
import {
  type AppError,
  InvalidPasswordError,
  UnExistUserError,
  UnexpectedError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface AuthQuery {
  execute(userId: string, password: string): Promise<Result<Account, AppError>>;
}

export class AuthQueryImpl implements AuthQuery {
  constructor(private readonly passwordHash: PasswordHash) {}

  private prisma = new PrismaClient();

  async execute(userId: string, password: string): Promise<Result<Account, AppError>> {
    const data = await this.prisma.account.findUnique({
      where: {
        userId,
      },
      include: {
        Role: true,
      },
    });

    if (!data) {
      return err(new UnExistUserError());
    }

    if (!(await this.passwordHash.compare(password, data.password))) {
      return err(new InvalidPasswordError());
    }

    const account = Account.create(
      data.id,
      data.userId,
      data.name,
      data.password,
      data.organizationId ?? undefined,
      data.Role.name as Role
    );

    if (account.isErr()) {
      return err(new UnexpectedError(account.error.message));
    }

    return ok(account.value);
  }
}
