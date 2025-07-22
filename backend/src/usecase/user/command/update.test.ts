import { Account } from "@/domain/account/account.js";
import { DuplicateUserIdError, UnExistAccountError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserUpdateCommandImpl } from "./update.js";

const mockAccountRepository = {
  findById: vi.fn(),
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

describe("UserUpdateCommandImpl", () => {
  it("正常にユーザーを更新", async () => {
    const userUpdateCommand = new UserUpdateCommandImpl(mockAccountRepository, mockPasswordHash);

    const mockId = "mock-uuid-123";
    const mockOrganizationId = "mock-organization-id";
    const mockRole = "Operator";

    const mockUserId = "new-mock-user-id";
    const mockName = "new-mock-name";
    const mockPassword = "new-password";
    const mockHashedPassword = "new-hashed-password";

    const mockData = Account.create(
      mockId,
      "mock-user-id",
      "テストユーザー",
      "hashed-password",
      mockOrganizationId,
      mockRole
    )._unsafeUnwrap();

    const mockNewData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      mockRole
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(ok(mockNewData));

    const result = await userUpdateCommand.execute(mockId, mockUserId, mockName, mockPassword);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockNewData);
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(mockId);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockNewData);
    }
  });

  it("ユーザーが存在しない場合", async () => {
    const userUpdateCommand = new UserUpdateCommandImpl(mockAccountRepository, mockPasswordHash);

    const mockId = "mock-uuid-123";
    const mockUserId = "new-mock-user-id";
    const mockName = "new-mock-name";
    const mockPassword = "new-password";

    mockAccountRepository.findById.mockResolvedValue(err(new UnExistAccountError()));

    const result = await userUpdateCommand.execute(mockId, mockUserId, mockName, mockPassword);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnExistAccountError);
    }
  });

  it("ユーザーIDが重複している場合", async () => {
    const userUpdateCommand = new UserUpdateCommandImpl(mockAccountRepository, mockPasswordHash);

    const mockId = "mock-uuid-123";
    const mockUserId = "mock-user-id";

    mockAccountRepository.findById.mockResolvedValue(
      ok(
        Account.create(
          mockId,
          mockUserId,
          "テストユーザー",
          "hashed-password",
          "mock-organization-id",
          "Operator"
        )._unsafeUnwrap()
      )
    );
    mockAccountRepository.findByUserId.mockResolvedValue(
      ok(
        Account.create(
          "mock-uuid-456",
          mockUserId,
          "テストユーザー2",
          "hashed-password-2",
          "mock-organization-id-2",
          "Operator"
        )._unsafeUnwrap()
      )
    );

    const result = await userUpdateCommand.execute(
      mockId,
      mockUserId,
      "new-mock-name",
      "new-password"
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(DuplicateUserIdError);
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(mockId);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
    }
  });

  it("データベースエラー", async () => {
    const userUpdateCommand = new UserUpdateCommandImpl(mockAccountRepository, mockPasswordHash);

    const mockId = "mock-uuid-123";
    const mockOrganizationId = "mock-organization-id";
    const mockRole = "Operator";

    const mockUserId = "new-mock-user-id";
    const mockName = "new-mock-name";
    const mockPassword = "new-password";
    const mockHashedPassword = "new-hashed-password";

    const mockData = Account.create(
      mockId,
      "mock-user-id",
      "テストユーザー",
      "hashed-password",
      mockOrganizationId,
      mockRole
    )._unsafeUnwrap();

    const mockNewData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      mockRole
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(err(new UnexpectedError()));

    const result = await userUpdateCommand.execute(mockId, mockUserId, mockName, mockPassword);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnexpectedError);
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(mockId);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockNewData);
    }
  });
});
