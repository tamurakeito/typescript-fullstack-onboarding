import { ok, err, Result } from "neverthrow";

export type TodoStatus = "NotStarted" | "InProgress" | "Completed";

export class TodoItem {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly organizationId: string;
  public readonly status: TodoStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    organizationId: string,
    status: TodoStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.organizationId = organizationId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: string,
    title: string,
    description: string,
    organizationId: string,
    status: TodoStatus,
    createdAt: Date,
    updatedAt: Date
  ): Result<TodoItem, Error> {
    if (!id) {
      return err(new Error("ID is required"));
    }
    if (!title) {
      return err(new Error("Title is required"));
    }
    if (!description) {
      return err(new Error("Description is required"));
    }
    if (!organizationId) {
      return err(new Error("Organization ID is required"));
    }
    if (!createdAt) {
      return err(new Error("Created at is required"));
    }
    if (!updatedAt) {
      return err(new Error("Updated at is required"));
    }
    return ok(new TodoItem(id, title, description, organizationId, status, createdAt, updatedAt));
  }
}
