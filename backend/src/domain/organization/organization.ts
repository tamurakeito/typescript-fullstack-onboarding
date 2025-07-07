import { type Result, err, ok } from "neverthrow";

export class Organization {
  public readonly id: string;
  public readonly name: string;

  private constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static create(id: string, name: string): Result<Organization, Error> {
    if (!id) {
      return err(new Error("ID is required"));
    }
    if (!name) {
      return err(new Error("Name is required"));
    }
    return ok(new Organization(id, name));
  }
}
