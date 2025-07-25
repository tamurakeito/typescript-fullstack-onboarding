import { Account } from "@/domain/account/account.js";
import type { Actor } from "@/domain/authorization/permission.js";
import {
  DuplicateUserIdError,
  ForbiddenError,
  UnExistAccountError,
  UnexpectedError,
} from "@/errors/errors.js";
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

    const mockActor: Actor = {
      ...mockData,
      permissions: ["update:User"],
      update: mockData.update,
    };

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(ok(mockNewData));

    const result = await userUpdateCommand.execute(
      mockId,
      mockUserId,
      mockName,
      mockPassword,
      mockActor
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockNewData);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockNewData);
    }
  });

  it("ロールがManager以下で操作対象が自分ではない場合", async () => {
    const userUpdateCommand = new UserUpdateCommandImpl(mockAccountRepository, mockPasswordHash);

    const mockAccount = Account.create(
      "mock-uuid-user-01",
      "mock-user-id",
      "テストユーザー",
      "hashed-password",
      "mock-organization-id",
      "Manager"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockAccount,
      permissions: ["update:User"],
      update: mockAccount.update,
    };

    const result = await userUpdateCommand.execute(
      "mock-uuid-user-02",
      "mock-user-id",
      "テストユーザー",
      "hashed-password",
      mockActor
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("ユーザーIDが重複している場合", async () => {
    const userUpdateCommand = new UserUpdateCommandImpl(mockAccountRepository, mockPasswordHash);

    const mockId = "mock-uuid-123";
    const mockUserId = "mock-user-id";

    const mockData = Account.create(
      mockId,
      mockUserId,
      "テストユーザー",
      "hashed-password",
      "mock-organization-id",
      "Operator"
    )._unsafeUnwrap();

    const mockActor: Actor = {
      ...mockData,
      permissions: ["update:User"],
      update: mockData.update,
    };

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
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
      "new-password",
      mockActor
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(DuplicateUserIdError);
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

    const mockActor: Actor = {
      ...mockData,
      permissions: ["update:User"],
      update: mockData.update,
    };

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
    mockAccountRepository.findByUserId.mockResolvedValue(err(new UnExistAccountError()));
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(err(new UnexpectedError()));

    const result = await userUpdateCommand.execute(
      mockId,
      mockUserId,
      mockName,
      mockPassword,
      mockActor
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnexpectedError);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockNewData);
    }
  });
});
