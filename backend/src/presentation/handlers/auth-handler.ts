import { BadRequestError, UnexpectedError } from "@/errors/errors.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import type { AuthQuery } from "@/usecase/auth/query/auth.js";
import type { Context } from "hono";

export class AuthHandler {
  constructor(
    private readonly authQuery: AuthQuery,
    private readonly jwtService: JwtService
  ) {}

  async signIn(c: Context) {
    const body = await c.req.json();
    const result = schemas.SignInRequest.safeParse(body);

    if (!result.success) {
      const error = new BadRequestError();
      return c.json({ message: error.message }, error.statusCode);
    }

    const userId = result.data.userId;
    const password = result.data.password;

    const user = await this.authQuery.execute(userId, password);

    if (user.isErr()) {
      return c.json({ message: user.error.message }, user.error.statusCode);
    }

    const token = await this.jwtService.generate({ role: user.value.role });

    const response = {
      account: user.value,
      token,
    };

    const parsedResponse = schemas.SignInResponse.safeParse(response);

    if (!parsedResponse.success) {
      const error = new UnexpectedError();
      return c.json({ message: error.message }, error.statusCode);
    }

    return c.json(response, 200);
  }
}
