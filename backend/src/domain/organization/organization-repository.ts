import { Result } from "neverthrow";

export interface OrganizationRepository {
    create(name: string): Promise<Result<void, Error>>;
    updateName(id: number, name: string): Promise<Result<void, Error>>;
    delete(id: number): Promise<Result<void, Error>>;
}