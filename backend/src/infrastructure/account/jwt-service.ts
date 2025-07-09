import { sign, verify } from "hono/jwt";
import { type Result, err, ok } from "neverthrow";

export interface JwtService {
  generate(payload: { role: string }): Promise<string>;
  verify(token: string): Promise<Result<{ role: string }, Error>>;
}

export class JwtServiceImpl implements JwtService {
  constructor(private readonly secret: string) {}

  async generate(payload: { role: string }): Promise<string> {
    return await sign(payload, this.secret);
  }

  async verify(token: string): Promise<Result<{ role: string }, Error>> {
    try {
      const decoded = await verify(token, this.secret);
      return ok({ role: decoded.role as string });
    } catch (error) {
      return err(error as Error);
    }
  }
}
