import { Account } from "@/domain/account/account.js";
import type { Permission } from "@/infrastructure/authorization/permission-service.js";
import { sign, verify } from "hono/jwt";
import { type Result, err, ok } from "neverthrow";

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
  generate(payload: { account: Account; permissions: Array<Permission> }): Promise<string>;
  verify(
    token: string
  ): Promise<Result<{ account: Account; permissions: Array<Permission> }, Error>>;
}

export class JwtServiceImpl implements JwtService {
  constructor(private readonly secret: string) {}

  async generate(payload: { account: Account; permissions: Array<Permission> }): Promise<string> {
    return await sign(payload, this.secret);
  }

  async verify(
    token: string
  ): Promise<Result<{ account: Account; permissions: Array<Permission> }, Error>> {
    try {
      const decoded = await verify(token, this.secret);
      if (!isAccount(decoded.account)) {
        return err(new Error("Invalid token payload"));
      }
      const accountData = decoded.account as Account;
      const accountResult = Account.create(
        accountData.id,
        accountData.userId,
        accountData.name,
        accountData.hashedPassword,
        accountData.organizationId,
        accountData.role
      );
      if (accountResult.isErr()) {
        return err(accountResult.error);
      }
      return ok({
        account: accountResult.value,
        permissions: decoded.permissions as Array<Permission>,
      });
    } catch (error) {
      return err(error as Error);
    }
  }
}
