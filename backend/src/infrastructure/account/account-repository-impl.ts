import type { AccountRepository } from "@/domain/account/account-repository.js";
import { Account } from "@/domain/account/account.js";
import { UnExistAccountError, UnexpectedError } from "@/errors/errors.js";
import type { AppError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export class AccountRepositoryImpl implements AccountRepository {
  private prisma = new PrismaClient();

  async findById(id: string): Promise<Result<Account, AppError>> {
    try {
      const result = await this.prisma.account.findUnique({ where: { id: id } });

      if (!result) {
        return err(new UnExistAccountError());
      }

      const data = Account.create(
        result.id,
        result.userId,
        result.name,
        result.password,
        result.organizationId ?? undefined,
        result.role
      );

      if (data.isErr()) {
        return err(new UnexpectedError(data.error.message));
      }

      return ok(data.value);
    } catch (error) {
      return err(new UnexpectedError());
    }
  }

  async findByUserId(userId: string): Promise<Result<Account, AppError>> {
    try {
      const result = await this.prisma.account.findUnique({ where: { userId: userId } });

      if (!result) {
        return err(new UnExistAccountError());
      }

      const data = Account.create(
        result.id,
        result.userId,
        result.name,
        result.password,
        result.organizationId ?? undefined,
        result.role
      );

      if (data.isErr()) {
        return err(new UnexpectedError(data.error.message));
      }

      return ok(data.value);
    } catch {
      return err(new UnexpectedError());
    }
  }

  async save(account: Account): Promise<Result<Account, AppError>> {
    try {
      const result = await this.prisma.account.upsert({
        where: { id: account.id },
        update: {
          userId: account.userId,
          name: account.name,
          password: account.hashedPassword,
          organizationId: account.organizationId,
          role: account.role,
        },
        create: {
          id: account.id,
          userId: account.userId,
          name: account.name,
          password: account.hashedPassword,
          organizationId: account.organizationId,
          role: account.role,
        },
      });

      const data = Account.create(
        result.id,
        result.userId,
        result.name,
        result.password,
        result.organizationId ?? undefined,
        result.role
      );
      if (data.isErr()) {
        return err(new UnexpectedError());
      }

      return ok(data.value);
    } catch {
      return err(new UnexpectedError());
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await this.prisma.account.delete({ where: { id } });
      return ok(undefined);
    } catch {
      return err(new UnexpectedError());
    }
  }
}
