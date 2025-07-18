import {
  DuplicateUserIdError,
  UnExistOrganizationError,
  UnexpectedError,
} from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserCreateCommandImpl } from "./create.js";

const mockAccountRepository = {
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/account/account-repository.js", () => ({
  AccountRepository: vi.fn(() => mockAccountRepository),
}));

const mockPasswordHash = {
  hash: vi.fn(),
  compare: vi.fn(),
};

vi.mock("@/domain/account/password-hash.js", () => ({
  PasswordHash: vi.fn(() => mockPasswordHash),
}));

const mockUserIdCheck = {
  execute: vi.fn(),
};

vi.mock("@/domain/account/user-id-check.js", () => ({
  UserIdCheck: vi.fn(() => mockUserIdCheck),
}));

const mockOrganizationIdCheck = {
  execute: vi.fn(),
};

vi.mock("@/domain/organization/organization-id-check.js", () => ({
  OrganizationIdCheck: vi.fn(() => mockOrganizationIdCheck),
}));

describe("UserCreateCommandImpl", () => {
  it("正常にユーザーを作成", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockPasswordHash,
      mockUserIdCheck,
      mockOrganizationIdCheck
    );

    const mockUserId = "mock-user-id";
    const mockName = "テストユーザー";
    const mockOrganizationId = "mock-uuid-123";
    const mockRole = "Manager";
    const mockHashedPassword = "hashed-password";
    const mockData = {
      id: "mock-uuid-123",
      userId: mockUserId,
      name: mockName,
      password: mockHashedPassword,
      organizationId: mockOrganizationId,
      role: mockRole,
    };

    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(ok(mockData));
    mockUserIdCheck.execute.mockResolvedValue(ok(false));
    mockOrganizationIdCheck.execute.mockResolvedValue(ok(true));

    const result = await userCreateCommand.execute(
      mockUserId,
      mockName,
      "password",
      mockOrganizationId,
      mockRole
    );
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockData);
    }
  });

  it("ユーザーIDが重複している場合エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockPasswordHash,
      mockUserIdCheck,
      mockOrganizationIdCheck
    );

    mockUserIdCheck.execute.mockResolvedValue(ok(true));

    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager"
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(DuplicateUserIdError);
    }
  });

  it("組織が存在しない場合エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockPasswordHash,
      mockUserIdCheck,
      mockOrganizationIdCheck
    );

    mockOrganizationIdCheck.execute.mockResolvedValue(ok(false));
    mockUserIdCheck.execute.mockResolvedValue(ok(false));

    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager"
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnExistOrganizationError);
    }
  });

  it("データベースエラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockPasswordHash,
      mockUserIdCheck,
      mockOrganizationIdCheck
    );

    mockPasswordHash.hash.mockResolvedValue("hashed-password");
    mockAccountRepository.save.mockResolvedValue(err(new UnexpectedError("データベースエラー")));
    mockUserIdCheck.execute.mockResolvedValue(ok(false));
    mockOrganizationIdCheck.execute.mockResolvedValue(ok(true));

    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager"
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnexpectedError);
    }
  });
});
