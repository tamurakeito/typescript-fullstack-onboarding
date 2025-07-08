import type { Hono } from "hono";
import type { AuthHandler } from "./handlers/auth-handler.js";

export function initRouting(app: Hono, authHandler: AuthHandler) {
  app.get("/", (c) => {
    return c.text("This is Org-Todo-App🐋");
  });

  app.post("/sign-in", (c) => authHandler.signIn(c));
}
