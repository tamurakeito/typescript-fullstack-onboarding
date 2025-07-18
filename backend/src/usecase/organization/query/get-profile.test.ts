import { describe, mock } from "node:test";
import { ForbiddenError, UnExistUserError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { expect, it, vi } from "vitest";
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
        role: "Manager",
      },
      {
        id: "mock-uuid-user-02",
        userId: "user-02",
        name: "テストユーザー02",
        role: "Operator",
      },
    ];

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: mockId,
      name: mockName,
      accounts: mockUsers,
    });

    const result = await organizationProfileQuery.execute(mockId, "SuperAdmin", "");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual({
        id: mockId,
        name: mockName,
        users: mockUsers,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          accounts: {
            select: {
              id: true,
              userId: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  });

  it("SuperAdminでないが自組織である場合", async () => {
    const organizationProfileQuery = new OrganizationProfileQueryImpl();

    const mockId = "mock-uuid-123";
    const mockName = "テスト組織";
    const mockUsers = [
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
    ];

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: mockId,
      name: mockName,
      accounts: mockUsers,
    });

    const result = await organizationProfileQuery.execute(mockId, "Manager", mockId);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual({
        id: mockId,
        name: mockName,
        users: mockUsers,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          accounts: {
            select: {
              id: true,
              userId: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  });

  it("SuperAdminでな自組織でない場合", async () => {
    const organizationProfileQuery = new OrganizationProfileQueryImpl();

    const result = await organizationProfileQuery.execute(
      "mock-uuid-123",
      "Manager",
      "other-organization-id"
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });
  it("組織が見つからない場合", async () => {
    const organizationProfileQuery = new OrganizationProfileQueryImpl();

    const mockId = "un-exist-uuid";

    mockPrismaClient.organization.findUnique.mockResolvedValue(null);

    const result = await organizationProfileQuery.execute(mockId, "SuperAdmin", "");
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
              role: true,
            },
          },
        },
      });
    }
  });
});
