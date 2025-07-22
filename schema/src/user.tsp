import "./error.tsp";

using TypeSpec.Http;

model CreateUserRequest {
  userId: string;
  name: string;
  password: string;
  organizationId?: string;
  role: Role;
}

model UpdateUserRoleRequest {
  role: Role;
}

@tag("User")
interface UserAPI {
  @post
  @route("/user")
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

  @put
  @route("/user-role/{id}")
  @summary("ユーザーロール更新")
  updateRole(@path id: string, @body body: UpdateUserRoleRequest):
    | {
        @statusCode
        statusCode: 200;

        @body
        account: Account;
      }
    | BadRequestError
    | ForbiddenError
    | InternalServerError;
}
