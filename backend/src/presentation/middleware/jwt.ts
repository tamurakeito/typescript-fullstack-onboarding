import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import { createMiddleware } from "hono/factory";

export const jwtMiddleware = (jwtService: JwtService) => {
  return createMiddleware<{ Variables: { role: string; organizationId: string } }>(
    async (c, next) => {
      const token = c.req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const decoded = await jwtService.verify(token);
      if (decoded.isErr()) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      c.set("role", decoded.value.role);
      c.set("organizationId", decoded.value.organizationId);
      return next();
    }
  );
};
