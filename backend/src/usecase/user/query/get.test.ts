import { Account } from "@/domain/account/account.js";
import { ForbiddenError, UnExistUserError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { describe, expect, it, vi } from "vitest";
import { UserQueryImpl } from "./get.js";

const mockPrismaClient = {
  organization: {
    findUnique: vi.fn(),
  },
  account: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

describe("UserQueryImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.account.findUnique;

  it("正常にユーザーを取得", async () => {
    const userQuery = new UserQueryImpl();

    const mockId = "mock-uuid-123";
    const mockName = "テストユーザー";
    const mockRole = "Manager";
    const mockOrganization = "テスト組織";

    const mockActor = Account.create(
      mockId,
      "user-01",
      mockName,
      "password",
      "org-uuid-123",
      "SuperAdmin"
    )._unsafeUnwrap();

    mockPrismaClient.account.findUnique.mockResolvedValue({
      id: mockId,
      userId: "user-01",
      name: mockName,
      roleId: "role-uuid-123",
      organization: {
        name: mockOrganization,
      },
      Role: {
        id: "role-uuid-123",
        name: mockRole,
      },
    });

    const result = await userQuery.execute(mockId, mockActor);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const user = result.value;
      expect(user).toEqual({
        id: mockId,
        userId: "user-01",
        name: mockName,
        role: mockRole,
        organization: mockOrganization,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          organization: {
            select: {
              id: false,
              name: true,
            },
          },
          Role: true,
        },
      });
    }
  });

  it("Manager以下の権限で他のユーザーを取得しようとした場合エラー", async () => {
    const userQuery = new UserQueryImpl();

    const mockId = "mock-uuid-123";
    const otherUserId = "mock-uuid-456";

    const mockActor = Account.create(
      otherUserId,
      "user-02",
      "テストユーザー02",
      "password",
      "org-uuid-123",
      "Manager"
    )._unsafeUnwrap();

    const result = await userQuery.execute(mockId, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("ユーザーが見つからない場合", async () => {
    const userQuery = new UserQueryImpl();

    const mockId = "mock-uuid-123";

    const mockActor = Account.create(
      mockId,
      "user-01",
      "テストユーザー",
      "password",
      "org-uuid-123",
      "SuperAdmin"
    )._unsafeUnwrap();

    mockPrismaClient.account.findUnique.mockResolvedValue(null);

    const result = await userQuery.execute(mockId, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnExistUserError);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          organization: {
            select: {
              id: false,
              name: true,
            },
          },
          Role: true,
        },
      });
    }
  });
});
