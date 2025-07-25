import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import type { TodoItem } from "@/domain/todo/todo.js";
import {
  ForbiddenError,
  NoOrganizationError,
  NoTodoItemError,
  UnexpectedError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { describe, expect, it, vi } from "vitest";
import { TodoListQueryImpl } from "./get-list.js";

const mockPrismaClient = {
  organization: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

describe("TodoListQueryImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.organization.findUnique;

  it("正常にタスク一覧を取得", async () => {
    const todoListQuery = new TodoListQueryImpl();
    const organizationId = "mock-uuid-123";
    const organizationName = "テスト組織01";
    const mockTodos = [
      {
        id: "mock-uuid-todo-01",
        title: "テストタスク01",
        description: "テストタスク01の説明",
        status: "NotStarted",
      },
      {
        id: "mock-uuid-todo-02",
        title: "テストタスク02",
        description: "テストタスク02の説明",
        status: "InProgress",
      },
    ];

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      organizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["read:Todo"],
      update: mockAccount.update,
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: organizationId,
      name: organizationName,
      todos: mockTodos,
    });

    const result = await todoListQuery.execute(organizationId, mockActor);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const todoList = result.value;
      expect(todoList.organizationId).toBe(organizationId);
      expect(todoList.organizationName).toBe(organizationName);
      expect(todoList.list).toEqual(mockTodos);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: organizationId },
        include: { todos: true },
      });
    }
  });

  it("Manager以下のユーザーが組織に所属していない場合", async () => {
    const todoListQuery = new TodoListQueryImpl();
    const organizationId = "mock-uuid-123";
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
      permissions: ["read:Todo"],
      update: mockAccount.update,
    };

    const result = await todoListQuery.execute(organizationId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("組織が存在しない場合", async () => {
    const todoListQuery = new TodoListQueryImpl();
    const organizationId = "mock-uuid-123";
    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      organizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["read:Todo"],
      update: mockAccount.update,
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue(null);

    const result = await todoListQuery.execute(organizationId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NoOrganizationError);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: organizationId },
        include: { todos: true },
      });
    }
  });

  it("Todoアイテムが存在しない場合", async () => {
    const todoListQuery = new TodoListQueryImpl();
    const organizationId = "mock-uuid-123";
    const mockTodos: Array<TodoItem> = [];

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      organizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["read:Todo"],
      update: mockAccount.update,
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: organizationId,
      todos: mockTodos,
    });

    const result = await todoListQuery.execute(organizationId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NoTodoItemError);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: organizationId },
        include: { todos: true },
      });
    }
  });
});
