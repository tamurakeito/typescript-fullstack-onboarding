import type { Account } from "@/domain/account/account.js";
import { ForbiddenError } from "@/errors/errors.js";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

export const permissionMiddleware = (method: (account: Account, c: Context) => boolean) => {
  return createMiddleware(async (c, next) => {
    const authAccount = c.get("authAccount") as Account;
    if (!method(authAccount, c)) {
      const error = new ForbiddenError();
      return c.json({ message: error.message }, error.statusCode);
    }
    return next();
  });
};
