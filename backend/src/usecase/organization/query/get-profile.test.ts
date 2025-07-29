import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import { ForbiddenError, UnExistUserError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { describe, expect, it, vi } from "vitest";
import { OrganizationProfileQueryImpl } from "./get-profile.js";

const mockPrismaClient = {
  organization: {
    findUnique: vi.fn(),
  },
  account: {
    findMany: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

describe("OrganizationProfileQueryImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.organization.findUnique;

  it("正常に組織プロファイルを取得", async () => {
    const organizationProfileQuery = new OrganizationProfileQueryImpl();

    const mockId = "mock-uuid-123";
    const mockName = "テスト組織";
    const mockUsers = [
      {
        id: "mock-uuid-user-01",
        userId: "user-01",
        name: "テストユーザー01",
        Role: {
          name: "Manager",
        },
      },
      {
        id: "mock-uuid-user-02",
        userId: "user-02",
        name: "テストユーザー02",
        Role: {
          name: "Operator",
        },
      },
    ];

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["read:Organization"],
      update: mockAccount.update,
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: mockId,
      name: mockName,
      accounts: mockUsers,
    });

    const result = await organizationProfileQuery.execute(mockId, mockActor);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual({
        id: mockId,
        name: mockName,
        users: [
          {
            id: "mock-uuid-user-01",
            userId: "user-01",
            name: "テストユーザー01",
            role: "Manager",
          },
          {
            id: "mock-uuid-user-02",
            userId: "user-02",
            name: "テストユーザー02",
            role: "Operator",
          },
        ],
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          accounts: {
            select: {
              id: true,
              userId: true,
              name: true,
              Role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }
  });

  it("組織のロールがManager以下で自分の組織ではない場合", async () => {
    const organizationProfileQuery = new OrganizationProfileQueryImpl();

    const mockId = "mock-uuid-123";
    const mockName = "テスト組織";
    const mockUsers = [
      {
        id: "mock-uuid-user-01",
        userId: "user-01",
        name: "テストユーザー01",
        Role: {
          name: "Manager",
        },
      },
      {
        id: "mock-uuid-user-02",
        userId: "user-02",
        name: "テストユーザー02",
        Role: {
          name: "Operator",
        },
      },
    ];

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
      permissions: ["read:Organization"],
      update: mockAccount.update,
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: mockId,
      name: mockName,
      accounts: mockUsers,
    });

    const result = await organizationProfileQuery.execute(mockId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("組織が見つからない場合", async () => {
    const organizationProfileQuery = new OrganizationProfileQueryImpl();

    const mockId = "un-exist-uuid";

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["read:Organization"],
      update: mockAccount.update,
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue(null);

    const result = await organizationProfileQuery.execute(mockId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnExistUserError);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          accounts: {
            select: {
              id: true,
              userId: true,
              name: true,
              Role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }
  });
});
