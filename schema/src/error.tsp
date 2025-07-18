using TypeSpec.Http;

model ErrorBody {
  message: string;
}

@error
model BadRequestError {
  @statusCode
  statusCode: 400;

  @body
  body: ErrorBody;
}

@error
model UnauthorizedError {
  @statusCode
  statusCode: 401;

  @body
  body: ErrorBody;
}

@error
model ForbiddenError {
  @statusCode
  statusCode: 403;

  @body
  body: ErrorBody;
}

@error
model NotFoundError {
  @statusCode
  statusCode: 404;

  @body
  body: ErrorBody;
}

@error
model InternalServerError {
  @statusCode
  statusCode: 500;

  @body
  body: ErrorBody;
}
