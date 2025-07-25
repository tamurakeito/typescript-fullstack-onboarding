import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { ForbiddenError, NoOrganizationError } from "@/errors/errors.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  let todoListQuery: TodoListQueryImpl;
  let mockFindUnique: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    todoListQuery = new TodoListQueryImpl();
    mockFindUnique = mockPrismaClient.organization.findUnique;
    vi.clearAllMocks();
  });

  it("正常にタスク一覧を取得", async () => {
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

    mockFindUnique.mockResolvedValue({
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
        include: {
          todos: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
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

    mockFindUnique.mockResolvedValue(null);

    const result = await todoListQuery.execute(organizationId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(NoOrganizationError);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: organizationId },
        include: {
          todos: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    }
  });
});
