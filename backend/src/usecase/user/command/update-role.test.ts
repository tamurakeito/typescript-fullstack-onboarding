import { Account } from "@/domain/account/account.js";
import { ForbiddenError, UnExistUserError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserUpdateRoleCommandImpl } from "./update-role.js";

const mockAccountRepository = {
  findById: vi.fn(),
  findByUserId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/account/account-repository.js", () => ({
  AccountRepository: vi.fn(() => mockAccountRepository),
}));

describe("UserUpdateRoleCommandImpl", () => {
  it("正常にユーザーロールを更新", async () => {
    const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(mockAccountRepository);

    const mockId = "mock-uuid-123";
    const mockUserId = "mock-user-id";
    const mockName = "テストユーザー";
    const mockHashedPassword = "hashed-password";
    const mockOrganizationId = "mock-uuid-123";
    const mockRole = "Manager";
    const mockData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      "Operator"
    )._unsafeUnwrap();

    const mockNewData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      mockRole
    )._unsafeUnwrap();

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-123",
      "Manager"
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
    mockAccountRepository.save.mockResolvedValue(ok(mockNewData));

    const result = await userUpdateRoleCommand.execute(mockId, mockRole, mockActor);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockNewData);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockNewData);
    }
  });

  it("ロールがManager以下で自分の組織ではない場合", async () => {
    const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(mockAccountRepository);

    const mockId = "mock-uuid-123";
    const mockUserId = "mock-user-id";
    const mockName = "テストユーザー";
    const mockHashedPassword = "hashed-password";
    const mockOrganizationId = "mock-uuid-123";
    const mockRole = "Manager";
    const mockData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      "Operator"
    )._unsafeUnwrap();

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-456",
      "Manager"
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));

    const result = await userUpdateRoleCommand.execute(mockId, mockRole, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("ロールがManager以下で操作対象ユーザーが既にSuperAdminの場合", async () => {
    const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(mockAccountRepository);

    const mockId = "mock-uuid-123";
    const mockUserId = "mock-user-id";
    const mockName = "テストユーザー";
    const mockHashedPassword = "hashed-password";
    const mockOrganizationId = "mock-uuid-123";
    const mockRole = "Manager";
    const mockData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      "SuperAdmin"
    )._unsafeUnwrap();

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockOrganizationId,
      "Manager"
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));

    const result = await userUpdateRoleCommand.execute(mockId, mockRole, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("ロールがManager以下で操作対象ユーザーの新規ロールにSuperAdminを指定している場合", async () => {
    const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(mockAccountRepository);

    const mockId = "mock-uuid-123";
    const mockUserId = "mock-user-id";
    const mockName = "テストユーザー";
    const mockHashedPassword = "hashed-password";
    const mockOrganizationId = "mock-uuid-123";
    const mockRole = "SuperAdmin";
    const mockData = Account.create(
      mockId,
      mockUserId,
      mockName,
      mockHashedPassword,
      mockOrganizationId,
      "Manager"
    )._unsafeUnwrap();

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      mockOrganizationId,
      "Manager"
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));

    const result = await userUpdateRoleCommand.execute(mockId, mockRole, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("データベースエラー", async () => {
    const userUpdateRoleCommand = new UserUpdateRoleCommandImpl(mockAccountRepository);

    const mockId = "mock-uuid-123";
    const mockRole = "Manager";
    const mockData = Account.create(
      mockId,
      "mock-user-id",
      "テストユーザー",
      "hashed-password",
      "mock-uuid-123",
      mockRole
    )._unsafeUnwrap();

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-123",
      "Manager"
    )._unsafeUnwrap();

    mockAccountRepository.findById.mockResolvedValue(ok(mockData));
    mockAccountRepository.save.mockResolvedValue(err(new UnexpectedError()));

    const result = await userUpdateRoleCommand.execute(mockId, mockRole, mockActor);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(UnexpectedError);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockData);
    }
  });
});
