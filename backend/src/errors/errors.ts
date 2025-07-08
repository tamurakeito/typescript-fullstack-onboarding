export abstract class AppError extends Error {
  abstract readonly statusCode: number;
}

export class UnExistUserError extends AppError {
  readonly statusCode = 401;
}

export class InvalidPasswordError extends AppError {
  readonly statusCode = 401;
}

export class UnexpectedError extends AppError {
  readonly statusCode = 500;
}
