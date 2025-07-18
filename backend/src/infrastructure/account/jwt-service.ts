import { Account } from "@/domain/account/account.js";
import { sign, verify } from "hono/jwt";
import { type Result, err, ok } from "neverthrow";

export interface JwtService {
  generate(payload: { account: Account }): Promise<string>;
  verify(token: string): Promise<Result<Account, Error>>;
}

export class JwtServiceImpl implements JwtService {
  constructor(private readonly secret: string) {}

  async generate(payload: { account: Account }): Promise<string> {
    return await sign(payload, this.secret);
  }

  async verify(token: string): Promise<Result<Account, Error>> {
    try {
      const decoded = await verify(token, this.secret);
      if (!decoded.account) {
        return err(new Error("Invalid token payload"));
      }
      const accountData = decoded.account as Account;
      const accountResult = Account.create(
        accountData.id,
        accountData.userId,
        accountData.name,
        accountData.organizationId,
        accountData.role
      );
      if (accountResult.isErr()) {
        return err(accountResult.error);
      }
      return ok(accountResult.value);
    } catch (error) {
      return err(error as Error);
    }
  }
}
