import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PasswordHashImpl } from "./infrastructure/account/password-hash-impl.js";
import { AuthHandler } from "./presentation/handlers/auth-handler.js";
import { initRouting } from "./presentation/routes.js";
import { AuthQueryImpl } from "./usecase/auth/query/auth.js";

const app = new Hono();

// DI
const authQuery = new AuthQueryImpl(new PasswordHashImpl());
const authHandler = new AuthHandler(authQuery);

initRouting(app, authHandler);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
