using TypeSpec.Http;

model ErrorBody {
  message: string;
}

// 400 Bad Request 用のエラーモデル
@error
model BadRequestError {
  @statusCode
  statusCode: 400;

  @body
  body: ErrorBody;
}

// 401 Unauthorized 用のエラーモデル
@error
model UnauthorizedError {
  @statusCode
  statusCode: 401;

  @body
  body: ErrorBody;
}

// 500 Internal Server Error 用のエラーモデルを追加
@error
model InternalServerError {
  @statusCode
  statusCode: 500;

  @body
  body: ErrorBody;
}
