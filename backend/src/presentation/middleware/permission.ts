import type { Action, Resource } from "@/domain/authorization/permission.js";
import { ForbiddenError } from "@/errors/errors.js";
import { createMiddleware } from "hono/factory";

export const permissionMiddleware = (action: Action, resource: Resource) => {
  return createMiddleware(async (c, next) => {
    const actor = c.get("actor");
    const hasPermission = actor.permissions.includes(`${action}:${resource}`);

    if (!hasPermission) {
      const error = new ForbiddenError();
      return c.json({ message: error.message }, error.statusCode);
    }
    await next();
  });
};
