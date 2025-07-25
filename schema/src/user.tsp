import "./error.tsp";

using TypeSpec.Http;

model CreateUserRequest {
  userId: string;
  name: string;
  password: string;
  organizationId?: string;
  role: Role;
}

model UpdateUserRequest {
  userId: string;
  name: string;
  password: string;
}

model UpdateUserRoleRequest {
  role: Role;
}

model UserProfile extends User {
  organization: string | null;
}

@tag("User")
interface UserAPI {
  @get
  @route("/user/{id}")
  @summary("ユーザープロファイルの取得")
  get(@path id: string):
    | UserProfile
    | BadRequestError
    | ForbiddenError
    | InternalServerError;

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
  @route("/user/{id}")
  @summary("ユーザープロファイルの更新")
  update(@path id: string, @body body: UpdateUserRequest):
    | {
        @statusCode
        statusCode: 200;

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

  @delete
  @route("/user/{id}")
  @summary("ユーザー削除")
  delete(@path id: string):
    | {
        @statusCode
        statusCode: 204;
      }
    | BadRequestError
    | ForbiddenError
    | InternalServerError;
}
