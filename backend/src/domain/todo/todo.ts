import { type Result, err, ok } from "neverthrow";

export type TodoStatus = "NotStarted" | "InProgress" | "Completed";

export class TodoItem {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly status: TodoStatus;

  constructor(id: string, title: string, description: string, status: TodoStatus) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
  }

  static create(
    id: string,
    title: string,
    description: string,
    status: TodoStatus
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
    return ok(new TodoItem(id, title, description, status));
  }
}

export class TodoList {
  public readonly organizationId: string;
  public readonly list: Array<TodoItem>;

  constructor(organizationId: string, list: Array<TodoItem>) {
    this.organizationId = organizationId;
    this.list = list;
  }

  static create(organizationId: string, list: Array<TodoItem>): Result<TodoList, Error> {
    if (!organizationId) {
      return err(new Error("Organization ID is required"));
    }
    if (!list) {
      return err(new Error("Items are required"));
    }
    return ok(new TodoList(organizationId, list));
  }
}
