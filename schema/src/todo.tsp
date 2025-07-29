import "./error.tsp";

using TypeSpec.Http;

enum TodoStatus {
  notStarted: "NotStarted",
  inProgress: "InProgress",
  completed: "Completed",
}

model TodoItem {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
}

model TodoList {
  organizationId: string;
  organizationName: string;
  list: Array<TodoItem>;
}

@tag("Todo")
interface Todo {
  @get
  @route("{organizationId}/todo-list")
  @summary("Todoリスト取得")
  getList(@path organizationId: string):
    | TodoList
    | BadRequestError
    | ForbiddenError
    | NotFoundError
    | InternalServerError;
}
