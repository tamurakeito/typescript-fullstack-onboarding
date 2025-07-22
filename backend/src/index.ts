import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { AccountRepositoryImpl } from "./infrastructure/account/account-repository-impl.js";
import { JwtServiceImpl } from "./infrastructure/account/jwt-service.js";
import { PasswordHashImpl } from "./infrastructure/account/password-hash-impl.js";
import { OrganizationRepositoryImpl } from "./infrastructure/organization/organization-repository-impl.js";
import { AuthHandler } from "./presentation/handlers/auth-handler.js";
import { OrganizationHandler } from "./presentation/handlers/organization-handler.js";
import { UserHandler } from "./presentation/handlers/user-handler.js";
import { LoggerMiddleware } from "./presentation/middleware/logger.js";
import type { Env } from "./presentation/middleware/logger.js";
import { initRouting } from "./presentation/routes.js";
import { AuthQueryImpl } from "./usecase/auth/query/auth.js";
import { OrganizationCreateCommandImpl } from "./usecase/organization/command/create.js";
import { OrganizationDeleteCommandImpl } from "./usecase/organization/command/delete.js";
import { OrganizationUpdateCommandImpl } from "./usecase/organization/command/update.js";
import { OrganizationListQueryImpl } from "./usecase/organization/query/get-list.js";
import { OrganizationProfileQueryImpl } from "./usecase/organization/query/get-profile.js";
import { UserCreateCommandImpl } from "./usecase/user/command/create.js";
import { UserUpdateRoleCommandImpl } from "./usecase/user/command/update-role.js";
import { UserUpdateCommandImpl } from "./usecase/user/command/update.js";

const app = new Hono<Env>();

app.use(requestId());
app.use(LoggerMiddleware());
app.use("*", cors());

// DI
const jwtService = new JwtServiceImpl(process.env.JWT_SECRET ?? "default_secret");
const passwordHash = new PasswordHashImpl();

const authQuery = new AuthQueryImpl(passwordHash);
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

const accountRepository = new AccountRepositoryImpl();
const userCreateCommand = new UserCreateCommandImpl(
  accountRepository,
  organizationRepository,
  passwordHash
);
const userUpdateCommand = new UserUpdateCommandImpl(accountRepository, passwordHash);
const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(accountRepository);
const userHandler = new UserHandler(userCreateCommand, userUpdateCommand, userUpdateRoleCommand);

initRouting(app, authHandler, organizationHandler, userHandler, jwtService, accountRepository);

serve(
  {
    fetch: app.fetch,
    port: 51002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
