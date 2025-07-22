import {
  DuplicateOrganizationNameError,
  ForbiddenError,
  UnExistOrganizationError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { OrganizationUpdateCommandImpl } from "./update.js";

const mockPrismaClient = {
  organization: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

const mockOrganizationRepository = {
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/organization/organization-repository.js", () => ({
  OrganizationRepository: vi.fn(() => mockOrganizationRepository),
}));

describe("OrganizationUpdateCommandImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.organization.findUnique;

  it("正常に組織を更新", async () => {
    const organizationUpdateCommand = new OrganizationUpdateCommandImpl(mockOrganizationRepository);

    const mockId = "mock-uuid-123";
    const mockDate = {
      id: mockId,
      name: "テスト組織01-new",
    };

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: mockId,
      name: "テスト組織01",
    });
    mockOrganizationRepository.save.mockResolvedValue(ok(mockDate));

    const result = await organizationUpdateCommand.execute(mockId, "テスト組織01-new");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual(mockDate);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: mockId } });
    }
  });
});

describe("OrganizationUpdateCommandImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.organization.findUnique;

  it("組織が存在しない場合", async () => {
    const organizationUpdateCommand = new OrganizationUpdateCommandImpl(mockOrganizationRepository);

    const mockId = "mock-uuid-123-unexist";

    mockPrismaClient.organization.findUnique.mockResolvedValue(undefined);

    const result = await organizationUpdateCommand.execute(mockId, "テスト組織01-new");

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnExistOrganizationError);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: mockId } });
    }
  });
});

describe("OrganizationUpdateCommandImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.organization.findUnique;

  it("組織名が重複している場合", async () => {
    const organizationUpdateCommand = new OrganizationUpdateCommandImpl(mockOrganizationRepository);

    const mockId = "mock-uuid-123";

    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: mockId,
      name: "テスト組織01",
    });

    mockOrganizationRepository.save.mockResolvedValue(err(new DuplicateOrganizationNameError()));

    const result = await organizationUpdateCommand.execute("mock-uuid-123", "テスト組織02");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(DuplicateOrganizationNameError);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: mockId } });
    }
  });
});
