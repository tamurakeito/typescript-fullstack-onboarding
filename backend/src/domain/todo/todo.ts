import { type Result, err, ok } from "neverthrow";

export type TodoStatus = "NotStarted" | "InProgress" | "Completed";

export class TodoItem {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly status: TodoStatus;
  public readonly organizationId: string;

  constructor(
    id: string,
    title: string,
    description: string,
    status: TodoStatus,
    organizationId: string
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.organizationId = organizationId;
  }

  static create(
    id: string,
    title: string,
    description: string,
    status: TodoStatus,
    organizationId: string
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
    return ok(new TodoItem(id, title, description, status, organizationId));
  }
}

export class TodoList {
  public readonly organizationId: string;
  public readonly organizationName: string;
  public readonly list: Array<TodoItem>;

  constructor(organizationId: string, organizationName: string, list: Array<TodoItem>) {
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.list = list;
  }

  static create(
    organizationId: string,
    organizationName: string,
    list: Array<TodoItem>
  ): Result<TodoList, Error> {
    if (!organizationId) {
      return err(new Error("Organization ID is required"));
    }
    if (!organizationName) {
      return err(new Error("Organization Name is required"));
    }
    if (!list) {
      return err(new Error("Items are required"));
    }
    return ok(new TodoList(organizationId, organizationName, list));
  }
}
