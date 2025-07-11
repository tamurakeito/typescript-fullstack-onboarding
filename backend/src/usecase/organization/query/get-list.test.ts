import { AppError, NoOrganizationError } from "@/errors/errors.js";
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

    const mockData = {
      id: "mock-uuid-123",
      name: "テスト組織",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaClient.organization.findMany.mockResolvedValue([mockData]);

    const result = await organizationListQuery.execute();
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organizations = result.value;
      expect(organizations).toBeInstanceOf(Array);
      expect(organizations.length).toBe(1);
      expect(organizations).toEqual([mockData]);
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
