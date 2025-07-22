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
    const userId = body.userId;
    const password = body.password;

    const user = await this.authQuery.execute(userId, password);

    if (user.isErr()) {
      c.get("logger").error("AuthQuery failed", {
        error: user.error.constructor.name,
        message: user.error.message,
        statusCode: user.error.statusCode,
      });
      return c.json({ message: user.error.message }, user.error.statusCode);
    }

    const token = await this.jwtService.generate({
      account: user.value,
    });

    const response = {
      account: user.value,
      token,
    };

    const parsedResponse = schemas.SignInResponse.safeParse(response);

    if (parsedResponse.error) {
      c.get("logger").error(parsedResponse.error.errors);
    }

    return c.json(parsedResponse.data, 200);
  }
}
