import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
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

const app = new Hono();

app.use("*", cors());

// DI
const jwtService = new JwtServiceImpl(process.env.JWT_SECRET ?? "default_secret");

const authQuery = new AuthQueryImpl(new PasswordHashImpl());
const authHandler = new AuthHandler(authQuery, jwtService);

const organizationRepository = new OrganizationRepositoryImpl();
const organizationListQuery = new OrganizationListQueryImpl();
const organizationCreateCommand = new OrganizationCreateCommandImpl(organizationRepository);
const organizationUpdateCommand = new OrganizationUpdateCommandImpl(organizationRepository);
const organizationDeleteCommand = new OrganizationDeleteCommandImpl(organizationRepository);
const organizationHandler = new OrganizationHandler(
  organizationListQuery,
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
