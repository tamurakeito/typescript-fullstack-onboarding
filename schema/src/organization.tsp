import "./error.tsp";

using TypeSpec.Http;

model Organization {
  id: string;
  name: string;
}

model User {
  id: string;
  userId: string;
  name: string;
  role: Role;
}

model OrganizationProfile {
  id: string;
  name: string;
  users: Array<User>;
}

model CreateOrganizationRequest {
  name: string;
}

model UpdateOrganizationRequest {
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

  @get
  @route("/organization/{id}")
  @summary("組織プロファイルの取得")
  get(@path id: string):
    | OrganizationProfile
    | BadRequestError
    | NotFoundError
    | InternalServerError;

  @post
  @route("/organization")
  @summary("組織作成")
  create(@body body: CreateOrganizationRequest): {
    @statusCode
    statusCode: 201;

    @body
    organization: Organization;
  } | BadRequestError | InternalServerError;

  @put
  @route("/organization/{id}")
  @summary("組織更新")
  update(@path id: string, @body body: UpdateOrganizationRequest): {
    @statusCode
    statusCode: 200;

    @body
    organization: Organization;
  } | BadRequestError | InternalServerError;

  @delete
  @route("/organization/{id}")
  @summary("組織削除")
  delete(@path id: string): {
    @statusCode
    statusCode: 204;
  } | BadRequestError | InternalServerError;
}
