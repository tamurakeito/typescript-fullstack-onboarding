import {
  DuplicateUserIdError,
  UnExistAccountError,
  UnExistOrganizationError,
  UnExistUserError,
  UnexpectedError,
} from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserCreateCommandImpl } from "./create.js";

const mockAccountRepository = {
  findByUserId: vi.fn(),
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

const mockOrganizationRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/organization/organization-repository.js", () => ({
  OrganizationRepository: vi.fn(() => mockOrganizationRepository),
}));

describe("UserCreateCommandImpl", () => {
  it("正常にユーザーを作成", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockOrganizationRepository,
      mockPasswordHash
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

    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));
    mockOrganizationRepository.findById.mockResolvedValue(ok({ id: mockOrganizationId }));
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(ok(mockData));

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
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockOrganizationRepository.findById).toHaveBeenCalledWith(mockOrganizationId);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith("password");
      expect(mockAccountRepository.save).toHaveBeenCalled();
    }
  });

  it("ユーザーIDが重複している場合エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockOrganizationRepository,
      mockPasswordHash
    );

    mockAccountRepository.findByUserId.mockResolvedValue(ok({ id: "existing-user" }));

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
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith("mock-user-id");
    }
  });

  it("組織が存在しない場合エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockOrganizationRepository,
      mockPasswordHash
    );

    mockOrganizationRepository.findById.mockResolvedValue(err(new UnExistOrganizationError()));
    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));

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
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith("mock-user-id");
      expect(mockOrganizationRepository.findById).toHaveBeenCalledWith("mock-uuid-123");
    }
  });

  it("データベースエラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(
      mockAccountRepository,
      mockOrganizationRepository,
      mockPasswordHash
    );

    const mockUserId = "mock-user-id";
    const mockName = "テストユーザー";
    const mockOrganizationId = "mock-uuid-123";
    const mockRole = "Manager";

    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));
    mockOrganizationRepository.findById.mockResolvedValue(ok({ id: mockOrganizationId }));
    mockPasswordHash.hash.mockResolvedValue("hashed-password");
    mockAccountRepository.save.mockResolvedValue(err(new UnexpectedError("データベースエラー")));

    const result = await userCreateCommand.execute(
      mockUserId,
      mockName,
      "password",
      mockOrganizationId,
      mockRole
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnexpectedError);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockOrganizationRepository.findById).toHaveBeenCalledWith(mockOrganizationId);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith("password");
      expect(mockAccountRepository.save).toHaveBeenCalled();
    }
  });
});
