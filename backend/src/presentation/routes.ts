import { BadRequestError } from "@/errors/errors.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";
import { z } from "zod";
import type { AuthHandler } from "./handlers/auth-handler.js";
import type { OrganizationHandler } from "./handlers/organization-handler.js";
import type { UserHandler } from "./handlers/user-handler.js";
import { jwtMiddleware } from "./middleware/jwt.js";
import type { Env } from "./middleware/logger.js";

export function initRouting(
  app: Hono<Env>,
  authHandler: AuthHandler,
  organizationHandler: OrganizationHandler,
  userHandler: UserHandler,
  jwtService: JwtService
) {
  app.get("/", (c) => {
    return c.text("This is Org-Todo-App🐋");
  });

  /* Auth */
  app.post(
    "/sign-in",
    zValidator("json", schemas.SignInRequest, (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    (c) => authHandler.signIn(c)
  );
  app.get("/auth-check", jwtMiddleware(jwtService), (c) => {
    return c.text(`Auth Check Success: role=${c.get("role")}`);
  });

  /* Organization */
  app.get("/organizations", jwtMiddleware(jwtService), (c) =>
    organizationHandler.getOrganizationList(c)
  );
  app.get(
    "/organization/:id",
    zValidator("param", z.object({ id: z.string().uuid() }), (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    (c) => organizationHandler.getOrganizationProfile(c)
  );
  app.post(
    "/organization",
    zValidator("json", schemas.CreateOrganizationRequest, (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    (c) => organizationHandler.createOrganization(c)
  );
  app.put(
    "/organization/:id",
    zValidator("param", z.object({ id: z.string().uuid() }), (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    zValidator("json", schemas.UpdateOrganizationRequest, (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    (c) => organizationHandler.updateOrganization(c)
  );
  app.delete(
    "/organization/:id",
    zValidator("param", z.object({ id: z.string().uuid() }), (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    (c) => organizationHandler.deleteOrganization(c)
  );

  /* User */
  app.post(
    "/user",
    zValidator("json", schemas.CreateUserRequest, (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    (c) => userHandler.createUser(c)
  );
}
