import type { JwtService } from "@/infrastructure/account/jwt-service.js";
import type { Hono } from "hono";
import type { AuthHandler } from "./handlers/auth-handler.js";
import { jwtMiddleware } from "./middleware/jwt.js";

export function initRouting(app: Hono, authHandler: AuthHandler, jwtService: JwtService) {
  app.get("/", (c) => {
    return c.text("This is Org-Todo-App🐋");
  });

  /* Auth */
  app.post("/sign-in", (c) => authHandler.signIn(c));
  app.get("/auth-check", jwtMiddleware(jwtService), (c) => {
    return c.text(`Auth Check Success: role=${c.get("role")}`);
  });
}
