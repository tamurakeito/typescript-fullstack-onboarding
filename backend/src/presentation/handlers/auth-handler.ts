import { BadRequestError, UnexpectedError } from "@/errors/errors.js";
import type { AuthQuery } from "@/usecase/auth/query/auth.js";
import type { Context } from "hono";

export class AuthHandler {
  constructor(private readonly authQuery: AuthQuery) {}

  async signIn(c: Context) {
    const body = await c.req.json();
    const userId = body.userId;
    const password = body.password;

    console.log("signIn: ", { userId, password });

    try {
      if (!userId || !password) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }

      const user = await this.authQuery.execute(userId, password);

      if (user.isErr()) {
        return c.json({ message: user.error.message }, user.error.statusCode);
      }

      return c.json(user.value, 200);
    } catch (error) {
      console.error(error);
      const err = new UnexpectedError();
      return c.json({ message: err.message }, err.statusCode);
    }
  }
}
