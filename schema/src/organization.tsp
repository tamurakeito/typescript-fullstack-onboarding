import "./error.tsp";

using TypeSpec.Http;

model Organization {
  id: string;
  name: string;
}

@tag("Organization")
interface OrganizationAPI {
  @get
  @route("/organizations")
  @summary("組織一覧の取得")
  getList():
    | Organization[]
    | BadRequestError
    | NotFoundError
    | InternalServerError;

  @post
  @route("/organization")
  @summary("組織作成")
  create(
    @body credentials: {
      name: string;
    },
  ): {
    @statusCode
    statusCode: 201;

    @body
    organization: Organization;
  } | BadRequestError | InternalServerError;

  @put
  @route("/organization/{id}")
  @summary("組織更新")
  update(
    @path id: string,
    @body credentials: {
      name: string;
    },
  ): {
    @statusCode
    statusCode: 200;
  } | BadRequestError | InternalServerError;

  @delete
  @route("/organization/{id}")
  @summary("組織削除")
  delete(@path id: string): {
    @statusCode
    statusCode: 204;
  } | BadRequestError | InternalServerError;
}
