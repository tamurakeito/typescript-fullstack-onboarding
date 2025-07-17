import "./error.tsp";

using TypeSpec.Http;

model CreateUserRequest {
  userId: string;
  name: string;
  password: string;
  organizationId?: string;
  role: Role;
}

@tag("User")
interface UserAPI {
  @post
  @route("/user/")
  @summary("ユーザー作成")
  create(@body body: CreateUserRequest):
    | {
        @statusCode
        statusCode: 201;

        @body
        account: Account;
      }
    | BadRequestError
    | ForbiddenError
    | InternalServerError;
}
