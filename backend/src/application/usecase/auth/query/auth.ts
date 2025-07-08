import type { PasswordHash } from "@/application/services/password-hash.js";
import { Account } from "@/domain/account/account.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";

export interface AuthQuery {
  execute(userId: string, password: string): Promise<Result<Account, Error>>;
}

export class AuthQueryImpl implements AuthQuery {
  constructor(private readonly passwordHash: PasswordHash) {}

  private prisma = new PrismaClient();

  async execute(userId: string, password: string): Promise<Result<Account, Error>> {
    const data = await this.prisma.account.findUnique({
      where: {
        userId,
      },
    });

    if (!data) {
      return err(new Error("ユーザーが見つかりません"));
    }

    const hashedPassword = await this.passwordHash.hash(password);

    if (hashedPassword !== data.password) {
      return err(new Error("パスワードが間違っています"));
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
