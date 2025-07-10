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
  organizationId?: string;
  role: Role;
}

model SignInRequest {
  userId: string;
  password: string;
}

model SignInResponse {
  account: Account;
  token: string;
}

@tag("Auth")
interface Auth {
  @post
  @route("/sign-in")
  @summary("ユーザー認証")
  login(@body credentials: SignInRequest):
    | SignInResponse
    | BadRequestError
    | UnauthorizedError
    | InternalServerError;
}
