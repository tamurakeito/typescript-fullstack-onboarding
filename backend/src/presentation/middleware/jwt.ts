import type { Account } from "@/domain/account/account.js";
import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import { createMiddleware } from "hono/factory";

export const jwtMiddleware = (jwtService: JwtService) => {
  return createMiddleware<{
    Variables: { authAccount: Account };
  }>(async (c, next) => {
    const token = c.req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const decoded = await jwtService.verify(token);
    if (decoded.isErr()) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("authAccount", decoded.value);
    return next();
  });
};
