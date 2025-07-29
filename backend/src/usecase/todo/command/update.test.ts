import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { TodoItem } from "@/domain/todo/todo.js";
import { ForbiddenError, UnExistTodoError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { TodoUpdateCommandImpl } from "./update.js";

const mockTodoRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/todo/todo-repository.js", () => ({
  TodoRepository: vi.fn(() => mockTodoRepository),
}));

describe("TodoUpdateCommandImpl", () => {
  it("正常にTodoアイテムを更新", async () => {
    const todoUpdateCommand = new TodoUpdateCommandImpl(mockTodoRepository);

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
      permissions: ["update:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted"
    )._unsafeUnwrap();

    const mockNewTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      "InProgress"
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(
      ok({ todo: mockTodoItem, organizationId: mockOrganizationId })
    );
    mockTodoRepository.save.mockResolvedValue(ok(mockNewTodoItem));

    const result = await todoUpdateCommand.execute(
      mockTodoItem.id,
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      "InProgress",
      mockActor
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(mockNewTodoItem);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
      expect(mockTodoRepository.save).toHaveBeenCalledWith(mockNewTodoItem, mockOrganizationId);
    }
  });

  it("存在しないTodoアイテムを更新しようとした場合", async () => {
    const todoUpdateCommand = new TodoUpdateCommandImpl(mockTodoRepository);

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
      permissions: ["update:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted"
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(err(new UnExistTodoError()));

    const result = await todoUpdateCommand.execute(
      mockTodoItem.id,
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      "InProgress",
      mockActor
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnExistTodoError);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
    }
  });

  it("Manager以下の権限でTodoアイテムを操作しようとした場合", async () => {
    const todoUpdateCommand = new TodoUpdateCommandImpl(mockTodoRepository);

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
      permissions: ["update:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted"
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(
      ok({ todo: mockTodoItem, organizationId: mockOrganizationId })
    );

    const result = await todoUpdateCommand.execute(
      mockTodoItem.id,
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      "InProgress",
      mockActor
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
    }
  });

  it("データベースエラー", async () => {
    const todoUpdateCommand = new TodoUpdateCommandImpl(mockTodoRepository);

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
      permissions: ["update:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01",
      "テストタスク01の説明",
      "NotStarted"
    )._unsafeUnwrap();

    const mockNewTodoItem = TodoItem.create(
      "mock-uuid-todo-01",
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      "InProgress"
    )._unsafeUnwrap();

    mockTodoRepository.findById.mockResolvedValue(
      ok({ todo: mockTodoItem, organizationId: mockOrganizationId })
    );
    mockTodoRepository.save.mockResolvedValue(err(new UnexpectedError()));

    const result = await todoUpdateCommand.execute(
      mockTodoItem.id,
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      "InProgress",
      mockActor
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnexpectedError);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
      expect(mockTodoRepository.save).toHaveBeenCalledWith(mockNewTodoItem, mockOrganizationId);
    }
  });
});
