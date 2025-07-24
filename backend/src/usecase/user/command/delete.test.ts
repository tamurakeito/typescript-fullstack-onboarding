import { UnExistUserError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserDeleteCommandImpl } from "./delete.js";

const mockAccountRepository = {
  findByUserId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/account/account-repository.js", () => ({
  AccountRepository: vi.fn(() => mockAccountRepository),
}));

describe("UserDeleteCommandImpl", () => {
  it("正常にユーザーを削除", async () => {
    const userDeleteCommand = new UserDeleteCommandImpl(mockAccountRepository);
    mockAccountRepository.delete.mockResolvedValue(ok(undefined));

    const result = await userDeleteCommand.execute("mock-uuid-123");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const user = result.value;
      expect(user).toEqual(undefined);
      expect(mockAccountRepository.delete).toHaveBeenCalledWith("mock-uuid-123");
    }
  });

  it("データベースエラー", async () => {
    const userDeleteCommand = new UserDeleteCommandImpl(mockAccountRepository);
    mockAccountRepository.delete.mockResolvedValue(err(new UnexpectedError()));

    const result = await userDeleteCommand.execute("mock-uuid-123");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnexpectedError);
      expect(mockAccountRepository.delete).toHaveBeenCalledWith("mock-uuid-123");
    }
  });
});
