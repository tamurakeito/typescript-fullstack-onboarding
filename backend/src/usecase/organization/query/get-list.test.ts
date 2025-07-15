import { NoOrganizationError } from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { describe, expect, it, vi } from "vitest";
import { OrganizationListQueryImpl } from "./get-list.js";

const mockPrismaClient = {
  organization: {
    findMany: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

describe("OrganizationListQueryImpl", () => {
  const prisma = new PrismaClient();
  const mockFindMany = prisma.organization.findMany;

  it("正常に組織一覧を取得", async () => {
    const organizationListQuery = new OrganizationListQueryImpl();

    const mockId = "mock-uuid-123";
    const mockName = "テスト組織";
    const mockData = {
      id: mockId,
      name: mockName,
    };

    mockPrismaClient.organization.findMany.mockResolvedValue([mockData]);

    const result = await organizationListQuery.execute();
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organizations = result.value;
      expect(organizations).toEqual([
        {
          id: mockId,
          name: mockName,
        },
      ]);
      expect(mockFindMany).toHaveBeenCalled();
    }
  });
});

describe("OrganizationListQueryImpl", () => {
  it("組織が存在しない場合", async () => {
    const organizationListQuery = new OrganizationListQueryImpl();

    mockPrismaClient.organization.findMany.mockResolvedValue([]);

    const result = await organizationListQuery.execute();
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(NoOrganizationError);
    }
  });
});
