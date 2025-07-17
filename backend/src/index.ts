import type { IncomingMessage, ServerResponse } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import type { Logger } from "pino";
import { pinoHttp } from "pino-http";
import { JwtServiceImpl } from "./infrastructure/account/jwt-service.js";
import { PasswordHashImpl } from "./infrastructure/account/password-hash-impl.js";
import { OrganizationRepositoryImpl } from "./infrastructure/organization/organization-repository-impl.js";
import { AuthHandler } from "./presentation/handlers/auth-handler.js";
import { OrganizationHandler } from "./presentation/handlers/organization-handler.js";
import { initRouting } from "./presentation/routes.js";
import { AuthQueryImpl } from "./usecase/auth/query/auth.js";
import { OrganizationCreateCommandImpl } from "./usecase/organization/command/create.js";
import { OrganizationDeleteCommandImpl } from "./usecase/organization/command/delete.js";
import { OrganizationUpdateCommandImpl } from "./usecase/organization/command/update.js";
import { OrganizationListQueryImpl } from "./usecase/organization/query/get-list.js";
import { OrganizationProfileQueryImpl } from "./usecase/organization/query/get-profile.js";

export type Env = {
  Variables: {
    logger: Logger;
  };
  Bindings: {
    incoming: IncomingMessage;
    outgoing: ServerResponse;
  };
};

const app = new Hono<Env>();

app.use(requestId());
app.use(async (c, next) => {
  c.env.incoming.id = c.var.requestId;
  await new Promise<void>((resolve) => pinoHttp()(c.env.incoming, c.env.outgoing, () => resolve()));

  c.set("logger", c.env.incoming.log);

  await next();
});
app.use("*", cors());

// DI
const jwtService = new JwtServiceImpl(process.env.JWT_SECRET ?? "default_secret");

const authQuery = new AuthQueryImpl(new PasswordHashImpl());
const authHandler = new AuthHandler(authQuery, jwtService);

const organizationRepository = new OrganizationRepositoryImpl();
const organizationListQuery = new OrganizationListQueryImpl();
const organizationProfileQuery = new OrganizationProfileQueryImpl();
const organizationCreateCommand = new OrganizationCreateCommandImpl(organizationRepository);
const organizationUpdateCommand = new OrganizationUpdateCommandImpl(organizationRepository);
const organizationDeleteCommand = new OrganizationDeleteCommandImpl(organizationRepository);
const organizationHandler = new OrganizationHandler(
  organizationListQuery,
  organizationProfileQuery,
  organizationCreateCommand,
  organizationUpdateCommand,
  organizationDeleteCommand
);

initRouting(app, authHandler, organizationHandler, jwtService);

serve(
  {
    fetch: app.fetch,
    port: 51002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
