import { ForbiddenError } from "@/errors/errors.js";
import type { Action, Resource } from "@/infrastructure/authorization/permission-service.js";
import { createMiddleware } from "hono/factory";

export const permissionMiddleware = (action: Action, resource: Resource) => {
  return createMiddleware(async (c, next) => {
    const actorWithPermissions = c.get("actorWithPermissions");
    const hasPermission = actorWithPermissions.permissions.includes(`${action}:${resource}`);

    if (!hasPermission) {
      const error = new ForbiddenError();
      return c.json({ message: error.message }, error.statusCode);
    }
    await next();
  });
};
