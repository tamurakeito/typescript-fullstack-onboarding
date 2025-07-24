import type { Account } from "@/domain/account/account.js";
import type { ActorWithPermissions } from "@/infrastructure/authorization/permission-service.js";
import { sign, verify } from "hono/jwt";
import { type Result, err, ok } from "neverthrow";

export type JwtPayload = {
  actorWithPermissions: ActorWithPermissions;
};

const isAccount = (obj: any): obj is Account => {
  return (
    obj != null &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.name === "string" &&
    (typeof obj.organizationId === "string" || obj.organizationId === undefined) &&
    (obj.role === "SuperAdmin" || obj.role === "Manager" || obj.role === "Operator")
  );
};

export interface JwtService {
  generate(payload: JwtPayload): Promise<string>;
  verify(token: string): Promise<Result<ActorWithPermissions, Error>>;
}

export class JwtServiceImpl implements JwtService {
  constructor(private readonly secret: string) {}

  async generate(payload: JwtPayload): Promise<string> {
    return await sign(payload, this.secret);
  }

  async verify(token: string): Promise<Result<ActorWithPermissions, Error>> {
    try {
      const decoded = (await verify(token, this.secret)) as JwtPayload;
      if (!isAccount(decoded.actorWithPermissions)) {
        return err(new Error("Invalid token payload"));
      }

      return ok(decoded.actorWithPermissions);
    } catch (error) {
      return err(error as Error);
    }
  }
}
