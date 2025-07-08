import "./error.tsp";

using TypeSpec.Http;

enum Role {
  superAdmin: "SuperAdmin",
  manager: "Manager",
  operator: "Operator",
}

model Account {
  id: string;
  userId: string;
  name: string;
  organizationId: string | null;
  role: Role;
}

@tag("Auth")
interface Auth {
  @post
  @route("/sign-in")
  @summary("ユーザー認証")
  login(
    @body credentials: {
      userId: string;
      password: string;
    },
  ): Account | BadRequestError | UnauthorizedError | InternalServerError;
}
