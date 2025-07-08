export abstract class AppError extends Error {
  abstract readonly statusCode: number;
}

/* auth */

export class UnExistUserError extends AppError {
  readonly statusCode = 401;
}

export class InvalidPasswordError extends AppError {
  readonly statusCode = 401;
}

/* 共通 */

export class BadRequestError extends AppError {
  readonly statusCode = 400;
}

export class UnexpectedError extends AppError {
  readonly statusCode = 500;
}
