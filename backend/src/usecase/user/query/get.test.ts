import { UnExistUserError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { ok } from "neverthrow";
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

    mockPrismaClient.account.findUnique.mockResolvedValue({
      id: mockId,
      userId: "user-01",
      name: mockName,
      role: mockRole,
      organization: {
        name: mockOrganization,
      },
    });

    const result = await userQuery.execute(mockId);

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
        },
      });
    }
  });

  it("ユーザーが見つからない場合", async () => {
    const userQuery = new UserQueryImpl();

    const mockId = "mock-uuid-123";

    mockPrismaClient.account.findUnique.mockResolvedValue(null);

    const result = await userQuery.execute(mockId);

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
        },
      });
    }
  });
});
