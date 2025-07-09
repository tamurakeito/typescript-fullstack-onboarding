import type { ContentfulStatusCode } from "hono/utils/http-status";

export abstract class AppError extends Error {
  abstract readonly statusCode: ContentfulStatusCode;
  abstract readonly message: string;
  constructor(discription?: string) {
    super(discription);
    console.error(`[ERROR LOG]: ${this.constructor.name} was instantiated.`);
  }
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

/* 共通 */

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly message = "Bad Request";
}

export class UnexpectedError extends AppError {
  readonly statusCode = 500;
  readonly message = "Internal Server Error";
}
