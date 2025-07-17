import "./error.tsp";

using TypeSpec.Http;

model User {
  id: string;
  userId: string;
  name: string;
  role: Role;
}

model CreateUserRequest extends User {
  password: string;
  organizationId: string;
}

model CreateUserResponse extends User {
  organizationId: string;
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
        response: CreateUserResponse;
      }
    | BadRequestError
    | ForbiddenError
    | InternalServerError;
}
