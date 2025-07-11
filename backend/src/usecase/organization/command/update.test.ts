import { DuplicateOrganizationNameError, UnExistOrganizationError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { OrganizationUpdateCommandImpl } from "./update.js";

const mockOrganizationRepository = {
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/organization/organization-repository.js", () => ({
  OrganizationRepository: vi.fn(() => mockOrganizationRepository),
}));

describe("OrganizationUpdateCommandImpl", () => {
  it("正常に組織を更新", async () => {
    const organizationUpdateCommand = new OrganizationUpdateCommandImpl(mockOrganizationRepository);

    mockOrganizationRepository.save.mockResolvedValue(ok(undefined));

    const result = await organizationUpdateCommand.execute("mock-uuid-123", "テスト組織01");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual(undefined);
    }
  });
});

describe("OrganizationUpdateCommandImpl", () => {
  it("組織が存在しない場合", async () => {
    const organizationUpdateCommand = new OrganizationUpdateCommandImpl(mockOrganizationRepository);

    mockOrganizationRepository.save.mockResolvedValue(err(new UnExistOrganizationError()));

    const result = await organizationUpdateCommand.execute("mock-uuid-123", "テスト組織01");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnExistOrganizationError);
    }
  });
});

describe("OrganizationUpdateCommandImpl", () => {
  it("組織名が重複している場合", async () => {
    const organizationUpdateCommand = new OrganizationUpdateCommandImpl(mockOrganizationRepository);

    mockOrganizationRepository.save.mockResolvedValue(err(new DuplicateOrganizationNameError()));

    const result = await organizationUpdateCommand.execute("mock-uuid-123", "テスト組織01");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(DuplicateOrganizationNameError);
    }
  });
});
