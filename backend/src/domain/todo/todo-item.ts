export type TodoStatus = "NotStarted" | "InProgress" | "Completed";

export class TodoItem {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly organizationId: string,
        public readonly status: TodoStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ){}
}