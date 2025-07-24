import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import type { ActorWithPermissions } from "@/infrastructure/authorization/permission-service.js";
import { createMiddleware } from "hono/factory";

export const jwtMiddleware = (jwtService: JwtService) => {
  return createMiddleware<{
    Variables: { actorWithPermissions: ActorWithPermissions };
  }>(async (c, next) => {
    const token = c.req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const decoded = await jwtService.verify(token);
    if (decoded.isErr()) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("actorWithPermissions", decoded.value);
    return next();
  });
};
