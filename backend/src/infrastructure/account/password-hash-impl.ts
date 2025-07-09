import type { PasswordHash } from "@/domain/account/password-hash.js";
import bcrypt from "bcrypt";

export class PasswordHashImpl implements PasswordHash {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
