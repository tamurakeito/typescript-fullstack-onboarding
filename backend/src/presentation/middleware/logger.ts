import type { IncomingMessage, ServerResponse } from "node:http";
import { createMiddleware } from "hono/factory";
import type { Logger } from "pino";
import { pinoHttp } from "pino-http";

export type Env = {
  Variables: {
    logger: Logger;
  };
  Bindings: {
    incoming: IncomingMessage;
    outgoing: ServerResponse;
  };
};

export const LoggerMiddleware = () => {
  return createMiddleware<Env>(async (c, next) => {
    c.env.incoming.id = c.var.requestId;
    await new Promise<void>((resolve) =>
      pinoHttp()(c.env.incoming, c.env.outgoing, () => resolve())
    );

    c.set("logger", c.env.incoming.log);

    await next();
  });
};
