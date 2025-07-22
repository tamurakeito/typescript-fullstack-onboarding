import type { AccountRepository } from "@/domain/account/account-repository.js";
import { BadRequestError } from "@/errors/errors.js";
import { createMiddleware } from "hono/factory";

export const accountGetMiddleware = (accountRepository: AccountRepository) => {
  return createMiddleware(async (c, next) => {
    const id = c.req.param("id");
    if (!id) {
      const error = new BadRequestError();
      return c.json({ message: error.message }, error.statusCode);
    }
    const account = await accountRepository.findById(id);
    if (account.isErr()) {
      return c.json({ message: account.error.message }, account.error.statusCode);
    }
    c.set("account", account.value);
    return next();
  });
};
