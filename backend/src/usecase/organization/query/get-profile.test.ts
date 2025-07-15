import { describe, mock } from "node:test";
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
    const mockOrganization = {
      id: mockId,
      name: mockName,
    };
    const mockUsers = [
      {
        id: "mock-uuid-user-01",
        name: "テストユーザー01",
        role: "Manager",
      },
      {
        id: "mock-uuid-user-02",
        name: "テストユーザー02",
        role: "Operator",
      },
    ];

    mockPrismaClient.organization.findUnique.mockResolvedValue(mockOrganization);
    mockPrismaClient.account.findMany.mockResolvedValue(mockUsers);

    const result = await organizationProfileQuery.execute(mockId);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual({
        id: mockId,
        name: mockName,
        users: mockUsers,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: mockId } });
    }
  });
});
