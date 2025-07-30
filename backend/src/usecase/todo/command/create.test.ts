import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { ForbiddenError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { TodoCreateCommandImpl } from "./create.js";

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid-todo-01"),
}));

const mockTodoRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/todo/todo-repository.js", () => ({
  TodoRepository: vi.fn(() => mockTodoRepository),
}));

const mockOrganizationRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/organization/organization-repository.js", () => ({
  OrganizationRepository: vi.fn(() => mockOrganizationRepository),
}));

describe("TodoCreateCommandImpl", () => {
  it("正常にTodoアイテムを作成", async () => {
    const todoCreateCommand = new TodoCreateCommandImpl(
      mockTodoRepository,
      mockOrganizationRepository
    );

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
      permissions: ["create:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = {
      id: "mock-uuid-todo-01",
      title: "テストタスク01",
      description: "テストタスク01の説明",
      status: "NotStarted",
      organizationId: mockOrganizationId,
    };

    mockOrganizationRepository.findById.mockResolvedValue(ok(mockOrganizationId));
    mockTodoRepository.save.mockResolvedValue(ok(mockTodoItem));

    const result = await todoCreateCommand.execute(
      "テストタスク01",
      "テストタスク01の説明",
      mockOrganizationId,
      mockActor
    );
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const todoItem = result.value;
      expect(todoItem).toEqual(mockTodoItem);
      expect(mockTodoRepository.save).toHaveBeenCalledWith(mockTodoItem);
    }
  });

  it("Manager以下で自分の組織以外のアイテムを作成しようとした場合", async () => {
    const todoCreateCommand = new TodoCreateCommandImpl(
      mockTodoRepository,
      mockOrganizationRepository
    );

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
      permissions: ["create:Todo"],
      update: mockAccount.update,
    };

    const result = await todoCreateCommand.execute(
      "テストタスク01",
      "テストタスク01の説明",
      mockOrganizationId,
      mockActor
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("データベースエラー", async () => {
    const todoCreateCommand = new TodoCreateCommandImpl(
      mockTodoRepository,
      mockOrganizationRepository
    );

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
      permissions: ["create:Todo"],
      update: mockAccount.update,
    };

    const mockTodoItem = {
      id: "mock-uuid-todo-01",
      title: "テストタスク01",
      description: "テストタスク01の説明",
      status: "NotStarted",
      organizationId: mockOrganizationId,
    };

    mockOrganizationRepository.findById.mockResolvedValue(ok(mockOrganizationId));
    mockTodoRepository.save.mockResolvedValue(err(new UnexpectedError()));

    const result = await todoCreateCommand.execute(
      "テストタスク01",
      "テストタスク01の説明",
      mockOrganizationId,
      mockActor
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnexpectedError);
      expect(mockTodoRepository.save).toHaveBeenCalledWith(mockTodoItem);
    }
  });
});
