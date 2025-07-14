import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import type { Hono } from "hono";
import type { AuthHandler } from "./handlers/auth-handler.js";
import type { OrganizationHandler } from "./handlers/organization-handler.js";
import { jwtMiddleware } from "./middleware/jwt.js";

export function initRouting(
  app: Hono,
  authHandler: AuthHandler,
  organizationHandler: OrganizationHandler,
  jwtService: JwtService
) {
  app.get("/", (c) => {
    return c.text("This is Org-Todo-App🐋");
  });

  /* Auth */
  app.post("/sign-in", (c) => authHandler.signIn(c));
  app.get("/auth-check", jwtMiddleware(jwtService), (c) => {
    return c.text(`Auth Check Success: role=${c.get("role")}`);
  });

  /* Organization */
  app.get("/organizations", jwtMiddleware(jwtService), (c) =>
    organizationHandler.getOrganizationList(c)
  );
  app.post("/organization", jwtMiddleware(jwtService), (c) =>
    organizationHandler.createOrganization(c)
  );
  app.put("organization", jwtMiddleware(jwtService), (c) =>
    organizationHandler.updateOrganization(c)
  );
  app.delete("organization", jwtMiddleware(jwtService), (c) =>
    organizationHandler.deleteOrganization(c)
  );
}
