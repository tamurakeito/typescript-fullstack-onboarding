import { Result } from "neverthrow";
import {type Role } from "./account.js";

export interface AccountRepository {
    create(userId: string, password: string, name: string, organizationId: string | undefined, role: Role): Promise<Result<void, Error>>;
    updateName(id: number, name: string): Promise<Result<void, Error>>;
    updateOrganizationId(id: number, organizationId: string): Promise<Result<void, Error>>;
    updateRole(id: number, role: Role): Promise<Result<void, Error>>;
    delete(id: number): Promise<Result<void, Error>>;
}