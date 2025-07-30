import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { TodoItem } from "@/domain/todo/todo.js";
import { ForbiddenError, UnExistTodoError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { TodoDeleteCommandImpl } from "./delete.js";

const mockTodoRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/todo/todo-repository.js", () => ({
  TodoRepository: vi.fn(() => mockTodoRepository),
}));

describe("TodoDeleteCommandImpl", () => {
  it("正常にTodoアイテムを削除", async () => {
    const todoDeleteCommand = new TodoDeleteCommandImpl(mockTodoRepository);

    const mockOrganizationId = "mock-uuid-123";

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockOrganizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["delete:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted",
      mockOrganizationId
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(ok(mockTodoItem));
    mockTodoRepository.delete.mockResolvedValue(ok(undefined));

    const result = await todoDeleteCommand.execute(mockTodoItem.id, mockActor);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(mockTodoItem.id);
    }
  });

  it("Todoアイテムが存在しない場合", async () => {
    const todoDeleteCommand = new TodoDeleteCommandImpl(mockTodoRepository);

    const mockTodoItemId = "mock-uuid-todo-01";
    const mockOrganizationId = "mock-uuid-123";

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockOrganizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["delete:Todo"],
      update: mockAccount.update,
    };

    mockTodoRepository.findById.mockResolvedValue(err(new UnExistTodoError()));

    const result = await todoDeleteCommand.execute(mockTodoItemId, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnExistTodoError);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItemId);
    }
  });

  it("Manager以下の権限で他の組織のTodoアイテムを削除しようとした場合", async () => {
    const todoDeleteCommand = new TodoDeleteCommandImpl(mockTodoRepository);

    const mockOrganizationId = "mock-uuid-123";

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-456",
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["delete:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted",
      mockOrganizationId
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(ok(mockTodoItem));

    const result = await todoDeleteCommand.execute(mockTodoItem.id, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
    }
  });

  it("データベースエラー", async () => {
    const todoDeleteCommand = new TodoDeleteCommandImpl(mockTodoRepository);

    const mockOrganizationId = "mock-uuid-123";

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockOrganizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["delete:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted",
      mockOrganizationId
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(ok(mockTodoItem));
    mockTodoRepository.delete.mockResolvedValue(err(new UnexpectedError()));

    const result = await todoDeleteCommand.execute(mockTodoItem.id, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnexpectedError);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(mockTodoItem.id);
    }
  });
});
