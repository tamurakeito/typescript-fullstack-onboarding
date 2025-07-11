import {
  DuplicateOrganizationNameError,
  UnExistOrganizationError,
  UnexpectedError,
} from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { OrganizationDeleteCommandImpl } from "./delete.js";

const mockOrganizationRepository = {
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/organization/organization-repository.js", () => ({
  OrganizationRepository: vi.fn(() => mockOrganizationRepository),
}));

describe("OrganizationDeleteCommandImpl", () => {
  it("正常に組織を削除", async () => {
    const organizationDeleteCommand = new OrganizationDeleteCommandImpl(mockOrganizationRepository);

    mockOrganizationRepository.delete.mockResolvedValue(ok(undefined));

    const result = await organizationDeleteCommand.execute("mock-uuid-123");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const organization = result.value;
      expect(organization).toEqual(undefined);
    }
  });
});

describe("OrganizationDeleteCommandImpl", () => {
  it("組織が存在しない場合", async () => {
    const organizationDeleteCommand = new OrganizationDeleteCommandImpl(mockOrganizationRepository);

    mockOrganizationRepository.delete.mockResolvedValue(err(new UnExistOrganizationError()));

    const result = await organizationDeleteCommand.execute("mock-uuid-123");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnExistOrganizationError);
    }
  });
});
