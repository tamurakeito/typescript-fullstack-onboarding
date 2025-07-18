import { DuplicateOrganizationNameError, ForbiddenError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { OrganizationCreateCommandImpl } from "./create.js";

const mockOrganizationRepository = {
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/organization/organization-repository.js", () => ({
  OrganizationRepository: vi.fn(() => mockOrganizationRepository),
}));

describe("OrganizationCreateCommandImpl", () => {
  it("正常に組織を作成", async () => {
    const organizationCreateCommand = new OrganizationCreateCommandImpl(mockOrganizationRepository);

    const mockData = {
      id: "mock-uuid-123",
      name: "テスト組織01",
    };

    mockOrganizationRepository.save.mockResolvedValue(ok(mockData));

    const result = await organizationCreateCommand.execute("テスト組織01", "SuperAdmin");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual(mockData);
    }
  });
});

describe("OrganizationCreateCommandImpl", () => {
  it("SuperAdminでない場合", async () => {
    const organizationCreateCommand = new OrganizationCreateCommandImpl(mockOrganizationRepository);

    const result = await organizationCreateCommand.execute("テスト組織01", "Manager");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(ForbiddenError);
    }
  });
});

describe("OrganizationCreateCommandImpl", () => {
  it("組織名が重複している場合", async () => {
    const organizationCreateCommand = new OrganizationCreateCommandImpl(mockOrganizationRepository);

    mockOrganizationRepository.save.mockResolvedValue(err(new DuplicateOrganizationNameError()));

    const result = await organizationCreateCommand.execute("テスト組織02", "SuperAdmin");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(DuplicateOrganizationNameError);
    }
  });
});
