import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { ForbiddenError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { TodoCreateCommandImpl } from "./create.js";
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

    const mockTodoItem = {
      id: "mock-uuid-todo-01",
      title: "テストタスク01",
      description: "テストタスク01の説明",
      status: "NotStarted",
    };

    const mockNewTodoItem = {
      id: "mock-uuid-todo-01",
      title: "テストタスク01の更新",
      description: "テストタスク01の更新の説明",
      status: "InProgress",
    };

    mockTodoRepository.findById.mockResolvedValue(
      ok({ todo: mockTodoItem, organizationId: mockOrganizationId })
    );
    mockTodoRepository.save.mockResolvedValue(ok(mockNewTodoItem));

    const result = await todoUpdateCommand.execute(
      mockTodoItem.id,
      "テストタスク01の更新",
      "テストタスク01の更新の説明",
      mockOrganizationId,
      mockActor
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(mockNewTodoItem);
      expect(mockTodoRepository.findById).toHaveBeenCalledWith(mockTodoItem.id);
      expect(mockTodoRepository.save).toHaveBeenCalledWith(mockNewTodoItem, mockOrganizationId);
    }
  });
});
