import type { Actor } from "@/domain/authorization/permission.js";
import { type AppError, ForbiddenError, UnExistUserError } from "@/errors/errors.js";
import type { schemas } from "@/generated/client/client.gen.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { type Result, err, ok } from "neverthrow";
import type { z } from "zod";

export interface UserQuery {
  execute(id: string, actor: Actor): Promise<Result<z.infer<typeof schemas.UserProfile>, AppError>>;
}

export class UserQueryImpl implements UserQuery {
  private prisma = new PrismaClient();

  async execute(
    id: string,
    actor: Actor
  ): Promise<Result<z.infer<typeof schemas.UserProfile>, AppError>> {
    if ((actor.role === "Manager" || actor.role === "Operator") && actor.id !== id) {
      return err(new ForbiddenError());
    }

    const userData = await this.prisma.account.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: false,
            name: true,
          },
        },
        Role: true,
      },
    });

    if (!userData) {
      return err(new UnExistUserError());
    }

    const user = {
      id: userData.id,
      userId: userData.userId,
      name: userData.name,
      role: userData.Role.name,
      organization: userData.organization?.name ?? null,
    };

    return ok(user);
  }
}
