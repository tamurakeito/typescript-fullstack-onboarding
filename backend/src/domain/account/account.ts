export type Role = "SuperAdmin" | "Manager" | "Operator";

export class Account {
    constructor(
        public readonly id: number,
        public readonly accountId: string,
        public readonly name: string,
        public readonly organizationId: string | undefined,
        public readonly role: Role,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ){}
}

