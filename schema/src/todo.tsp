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
  organizationId: string;
}

model TodoList {
  organizationId: string;
  organizationName: string;
  list: Array<TodoItem>;
}

model CreateTodoItemRequest {
  title: string;
  description: string;
  organizationId: string;
}

model UpdateTodoItemRequest {
  title: string;
  description: string;
  status: TodoStatus;
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

  @post
  @route("/todo")
  @summary("Todoアイテム作成")
  create(@body body: CreateTodoItemRequest):
    | {
        @statusCode
        statusCode: 201;

        @body
        todoItem: TodoItem;
      }
    | BadRequestError
    | ForbiddenError
    | NotFoundError
    | InternalServerError;

  @put
  @route("/todo/{id}")
  @summary("Todoアイテム更新")
  update(@path id: string, @body body: UpdateTodoItemRequest):
    | {
        @statusCode
        statusCode: 200;

        @body
        todoItem: TodoItem;
      }
    | BadRequestError
    | ForbiddenError
    | NotFoundError
    | InternalServerError;

  @delete
  @route("/todo/{id}")
  @summary("Todoアイテム削除")
  delete(@path id: string):
    | {
        @statusCode
        statusCode: 204;
      }
    | BadRequestError
    | ForbiddenError
    | NotFoundError
    | InternalServerError;
}
