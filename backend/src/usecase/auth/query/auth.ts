import { Account } from "@/domain/account/account.js";
import type { PasswordHash } from "@/domain/account/password-hash.js";
import { InvalidPasswordError, UnExistUserError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface AuthQuery {
  execute(
    userId: string | undefined,
    password: string | undefined
  ): Promise<Result<Account, Error>>;
}

export class AuthQueryImpl implements AuthQuery {
  constructor(private readonly passwordHash: PasswordHash) {}

  private prisma = new PrismaClient();

  async execute(
    userId: string | undefined,
    password: string | undefined
  ): Promise<Result<Account, Error>> {
    if (!userId || !password) {
      return err(new Error("ユーザーIDとパスワードは必須です"));
    }

    const data = await this.prisma.account.findUnique({
      where: {
        userId,
      },
    });

    if (!data) {
      return err(new UnExistUserError());
    }

    const hashedPassword = await this.passwordHash.hash(password);

    if (hashedPassword !== data.password) {
      return err(new InvalidPasswordError());
    }

    const account = Account.create(
      data.id,
      data.userId,
      data.name,
      data.organizationId ?? undefined,
      data.role
    );

    return account;
  }
}
