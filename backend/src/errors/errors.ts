import type { ContentfulStatusCode } from "hono/utils/http-status";

export abstract class AppError extends Error {
  abstract readonly statusCode: ContentfulStatusCode;
  abstract readonly message: string;
}

/* auth */

export class UnExistUserError extends AppError {
  readonly statusCode = 401;
  readonly message = "Unauthorized";
}

export class InvalidPasswordError extends AppError {
  readonly statusCode = 401;
  readonly message = "Unauthorized";
}

/* organization */

export class NoOrganizationError extends AppError {
  readonly statusCode = 404;
  readonly message = "Not Found";
}

export class DuplicateOrganizationNameError extends AppError {
  readonly statusCode = 400;
  readonly message = "Bad Request";
}

export class UnExistOrganizationError extends AppError {
  readonly statusCode = 404;
  readonly message = "Not Found";
}

/* user */

export class DuplicateUserIdError extends AppError {
  readonly statusCode = 409;
  readonly message = "Conflict";
}

/* 共通 */

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly message = "Bad Request";
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly message = "Forbidden";
}

export class UnexpectedError extends AppError {
  readonly statusCode = 500;
  readonly message = "Internal Server Error";
}
