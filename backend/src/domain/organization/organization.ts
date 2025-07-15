import { type Result, err, ok } from "neverthrow";

export class Organization {
  public readonly id: string;
  public readonly name: string;

  protected constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static create(id: string, name: string): Result<Organization, Error> {
    if (!id) {
      return err(new Error("IDは必須です"));
    }
    if (!name) {
      return err(new Error("名前は必須です"));
    }
    return ok(new Organization(id, name));
  }
}

export class OrganizationProfile extends Organization {
  public readonly users: User[];

  private constructor(id: string, name: string, users: User[]) {
    super(id, name);
    this.users = users;
  }

  static createProfile(
    id: string,
    name: string,
    users: User[]
  ): Result<OrganizationProfile, Error> {
    if (!id) {
      return err(new Error("IDは必須です"));
    }
    if (!name) {
      return err(new Error("名前は必須です"));
    }
    if (!Array.isArray(users)) {
      return err(new Error("ユーザー一覧が不正です"));
    }
    return ok(new OrganizationProfile(id, name, users));
  }
}

export type User = {
  id: string;
  name: string;
  role: string;
};
