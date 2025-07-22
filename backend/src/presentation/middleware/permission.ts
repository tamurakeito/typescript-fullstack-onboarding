import type { Account } from "@/domain/account/account.js";
import { ForbiddenError } from "@/errors/errors.js";
import { createMiddleware } from "hono/factory";

export type Action = "create" | "read" | "update" | "delete" | "readAll";

export type AccountId = string;
export type AccountResource = {
  type: "Account";
  content: AccountId | undefined;
};
export type OrganizationId = string;
export type OrganizationResource = {
  type: "Organization";
  content: OrganizationId | undefined;
};
export type Resource = AccountResource | OrganizationResource;

const permissionPolicy = (actor: Account, action: Action, resource: Resource): boolean => {
  if (actor.role === "SuperAdmin") {
    return true;
  }

  if (resource.type === "Organization") {
    switch (action) {
      case "read":
        if (actor.role === "Manager" && actor.organizationId === resource.content) {
          return true;
        }
    }
  }

  return false;
};

export const organizationPermissionMiddleware = (action: Action) => {
  return createMiddleware(async (c, next) => {
    const actor = c.get("actor");
    const targetOrgId = c.req.param("id");

    const allowed = permissionPolicy(actor, action, {
      type: "Organization",
      content: targetOrgId,
    });

    if (!allowed) {
      const error = new ForbiddenError();
      return c.json({ message: error.message }, error.statusCode);
    }
    return next();
  });
};

export const accountPermissionMiddleware = (action: Action) => {
  return createMiddleware(async (c, next) => {
    const actor = c.get("actor");
    const targetAccountId = c.req.param("id");

    const allowed = permissionPolicy(actor, action, {
      type: "Account",
      content: targetAccountId,
    });

    if (!allowed) {
      const error = new ForbiddenError();
      return c.json({ message: error.message }, error.statusCode);
    }
    return next();
  });
};
// export const todoPermissionMiddleware
