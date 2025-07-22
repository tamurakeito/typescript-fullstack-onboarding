import type { Account, Role } from "@/domain/account/account.js";
import { ForbiddenError } from "@/errors/errors.js";
import { createMiddleware } from "hono/factory";

export type Action = "create" | "read" | "update" | "delete" | "readAll";

export type AccountContent = {
  id: string;
  userId: string | undefined;
  organizationId: string | undefined;
  role: Role | undefined;
  roleGranted: Role | undefined;
};
export type AccountResource = {
  type: "Account";
  content: AccountContent | undefined;
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

  if (resource.type === "Account") {
    switch (action) {
      case "create":
        if (
          actor.role === "Manager" &&
          actor.organizationId === resource.content?.organizationId &&
          (resource.content?.role === "Manager" || resource.content?.role === "Operator")
        ) {
          return true;
        }
        break;
      case "update":
        if (
          actor.role === "Manager" &&
          actor.organizationId === resource.content?.organizationId &&
          (resource.content?.role === "Manager" || resource.content?.role === "Operator") &&
          (resource.content?.roleGranted === "Manager" ||
            resource.content?.roleGranted === "Operator")
        ) {
          return true;
        }
        break;
      case "delete":
        console.log(actor);
        console.log(resource.content);
        if (actor.role === "Manager" && actor.organizationId === resource.content?.organizationId) {
          return true;
        }
        break;
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
  return createMiddleware<{ Variables: { actor: Account; account: Account } }>(async (c, next) => {
    const actor = c.get("actor");
    const account = c.get("account");

    let body: Record<string, unknown> | undefined;
    if (action !== "delete") {
      body = await c.req.json();
    }

    if (account) {
      const allowed = permissionPolicy(actor, action, {
        type: "Account",
        content: {
          id: account.id,
          userId: account.userId,
          organizationId: account.organizationId,
          role: account.role,
          roleGranted: (body?.role as Role) ?? undefined,
        },
      });

      if (!allowed) {
        const error = new ForbiddenError();
        return c.json({ message: error.message }, error.statusCode);
      }
    } else {
      const allowed = permissionPolicy(actor, action, {
        type: "Account",
        content: {
          id: "",
          userId: (body?.userId as string) ?? undefined,
          organizationId: (body?.organizationId as string) ?? undefined,
          role: (body?.role as Role) ?? undefined,
          roleGranted: undefined,
        },
      });

      if (!allowed) {
        const error = new ForbiddenError();
        return c.json({ message: error.message }, error.statusCode);
      }
    }
    return next();
  });
};
