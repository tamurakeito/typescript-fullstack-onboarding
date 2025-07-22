import type { AccountRepository } from "@/domain/account/account-repository.js";
import { BadRequestError } from "@/errors/errors.js";
import { schemas } from "@/generated/client/client.gen.js";
import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";
import { z } from "zod";
import type { AuthHandler } from "./handlers/auth-handler.js";
import type { OrganizationHandler } from "./handlers/organization-handler.js";
import type { UserHandler } from "./handlers/user-handler.js";
import { accountGetMiddleware } from "./middleware/account-get.js";
import { jwtMiddleware } from "./middleware/jwt.js";
import type { Env } from "./middleware/logger.js";
import {
  accountPermissionMiddleware,
  organizationPermissionMiddleware,
} from "./middleware/permission.js";

export function initRouting(
  app: Hono<Env>,
  authHandler: AuthHandler,
  organizationHandler: OrganizationHandler,
  userHandler: UserHandler,
  jwtService: JwtService,
  accountRepository: AccountRepository
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
    return c.text(`Auth Check Success: role=${c.get("actor").role}`);
  });

  /* Organization */
  app.get(
    "/organizations",
    jwtMiddleware(jwtService),
    organizationPermissionMiddleware("readAll"),
    (c) => organizationHandler.getOrganizationList(c)
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
    organizationPermissionMiddleware("read"),
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
    organizationPermissionMiddleware("create"),
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
    organizationPermissionMiddleware("update"),
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
    organizationPermissionMiddleware("delete"),
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
    accountPermissionMiddleware("create"),
    (c) => userHandler.createUser(c)
  );
  app.put(
    "/user/:id",
    zValidator("param", z.object({ id: z.string().uuid() }), (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    zValidator("json", schemas.UpdateUserRequest, (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    accountPermissionMiddleware("update", accountRepository),
    (c) => userHandler.updateUser(c)
  );
  app.put(
    "/user-role/:id",
    zValidator("param", z.object({ id: z.string().uuid() }), (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    zValidator("json", schemas.UpdateUserRoleRequest, (result, c) => {
      if (!result.success) {
        const error = new BadRequestError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }),
    jwtMiddleware(jwtService),
    accountGetMiddleware(accountRepository),
    accountPermissionMiddleware("update"),
    (c) => userHandler.updateUserRole(c)
  );
}
