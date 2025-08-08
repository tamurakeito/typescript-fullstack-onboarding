import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { AccountRepositoryImpl } from "./infrastructure/account/account-repository-impl.js";
import { JwtServiceImpl } from "./infrastructure/account/jwt-service.js";
import { PasswordHashImpl } from "./infrastructure/account/password-hash-impl.js";
import { PermissionServiceImpl } from "./infrastructure/authorization/permission-service-impl.js";
import { OrganizationRepositoryImpl } from "./infrastructure/organization/organization-repository-impl.js";
import { TodoRepositoryImpl } from "./infrastructure/todo/todo-repository-impl.js";
import { AuthHandler } from "./presentation/handlers/auth-handler.js";
import { OrganizationHandler } from "./presentation/handlers/organization-handler.js";
import { TodoHandler } from "./presentation/handlers/todo-handler.js";
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
import { TodoCreateCommandImpl } from "./usecase/todo/command/create.js";
import { TodoDeleteCommandImpl } from "./usecase/todo/command/delete.js";
import { TodoUpdateCommandImpl } from "./usecase/todo/command/update.js";
import { TodoListQueryImpl } from "./usecase/todo/query/get-list.js";
import { UserCreateCommandImpl } from "./usecase/user/command/create.js";
import { UserDeleteCommandImpl } from "./usecase/user/command/delete.js";
import { UserUpdateRoleCommandImpl } from "./usecase/user/command/update-role.js";
import { UserUpdateCommandImpl } from "./usecase/user/command/update.js";
import { UserQueryImpl } from "./usecase/user/query/get.js";

const app = new Hono<Env>();

app.use(requestId());
app.use(LoggerMiddleware());
app.use("*", cors());

// DI
const jwtService = new JwtServiceImpl(process.env.JWT_SECRET ?? "default_secret");
const passwordHash = new PasswordHashImpl();
const permissionService = new PermissionServiceImpl();

const authQuery = new AuthQueryImpl(passwordHash);
const authHandler = new AuthHandler(authQuery, jwtService, permissionService);

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
const userQuery = new UserQueryImpl();
const userCreateCommand = new UserCreateCommandImpl(
  accountRepository,
  organizationRepository,
  passwordHash
);

const userUpdateCommand = new UserUpdateCommandImpl(accountRepository, passwordHash);
const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(accountRepository);
const userDeleteCommand = new UserDeleteCommandImpl(accountRepository);
const userHandler = new UserHandler(
  userQuery,
  userCreateCommand,
  userUpdateCommand,
  userUpdateRoleCommand,
  userDeleteCommand
);

const todoListQuery = new TodoListQueryImpl();
const todoRepository = new TodoRepositoryImpl();
const todoCreateCommand = new TodoCreateCommandImpl(todoRepository, organizationRepository);
const todoUpdateCommand = new TodoUpdateCommandImpl(todoRepository);
const todoDeleteCommand = new TodoDeleteCommandImpl(todoRepository);
const todoHandler = new TodoHandler(
  todoListQuery,
  todoCreateCommand,
  todoUpdateCommand,
  todoDeleteCommand
);

initRouting(app, authHandler, organizationHandler, userHandler, todoHandler, jwtService);

const port = Number(process.env.PORT) || 51002;

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
