import { Account } from "@/domain/account/account.js";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserUpdateRoleCommandImpl } from "./update-role.js";

const mockAccountRepository = {
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

    const mockUserId = "mock-user-id";
    const mockRole = "Manager";
    const mockData = Account.create(
      "mock-uuid-123",
      mockUserId,
      "テストユーザー",
      "hashed-password",
      "mock-uuid-123",
      "Operator"
    )._unsafeUnwrap();

    const mockNewData = Account.create(
      "mock-uuid-123",
      mockUserId,
      "テストユーザー",
      "hashed-password",
      "mock-uuid-123",
      mockRole
    )._unsafeUnwrap();

    mockAccountRepository.findByUserId.mockResolvedValue(ok(mockData));
    mockAccountRepository.save.mockResolvedValue(ok(mockNewData));

    const result = await userUpdateRoleCommand.execute(mockUserId, mockRole);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockNewData);
      expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(mockNewData);
    }
  });
});
