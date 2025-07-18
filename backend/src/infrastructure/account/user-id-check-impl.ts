import type { UserIdCheck } from "@/domain/account/user-id-check.js";
import { type AppError, UnexpectedError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/client.js";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export class UserIdCheckImpl implements UserIdCheck {
  private prisma = new PrismaClient();

  async execute(userId: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await this.prisma.account.findUnique({
        where: {
          userId,
        },
      });

      return ok(result !== null);
    } catch {
      return err(new UnexpectedError());
    }
  }
}
