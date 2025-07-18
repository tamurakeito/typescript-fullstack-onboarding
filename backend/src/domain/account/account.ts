import { type Result, err, ok } from "neverthrow";

export type Role = "SuperAdmin" | "Manager" | "Operator";

export class Account {
  public readonly id: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly hashedPassword: string;
  public readonly organizationId: string | undefined;
  public readonly role: Role;

  private constructor(
    id: string,
    userId: string,
    name: string,
    hashedPassword: string,
    organizationId: string | undefined,
    role: Role
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.hashedPassword = hashedPassword;
    this.organizationId = organizationId;
    this.role = role;
  }

  static create(
    id: string,
    userId: string,
    name: string,
    hashedPassword: string,
    organizationId: string | undefined,
    role: Role
  ): Result<Account, Error> {
    if (!id) {
      return err(new Error("ID is required"));
    }
    if (!userId) {
      return err(new Error("User ID is required"));
    }
    if (!name) {
      return err(new Error("Name is required"));
    }
    if (!hashedPassword) {
      return err(new Error("Hashed password is required"));
    }
    return ok(new Account(id, userId, name, hashedPassword, organizationId, role));
  }
}
