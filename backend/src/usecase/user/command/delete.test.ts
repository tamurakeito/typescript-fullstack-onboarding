import { Account } from "@/domain/account/account.js";
import { ForbiddenError, UnexpectedError } from "@/errors/errors.js";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserDeleteCommandImpl } from "./delete.js";

const mockAccountRepository = {
  findById: vi.fn(),
  findByUserId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/domain/account/account-repository.js", () => ({
  AccountRepository: vi.fn(() => mockAccountRepository),
}));

describe("UserDeleteCommandImpl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常にユーザーを削除", async () => {
    const userDeleteCommand = new UserDeleteCommandImpl(mockAccountRepository);

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-123",
      "Manager"
    )._unsafeUnwrap();
    const mockId = "mock-uuid-user-02";

    mockAccountRepository.findById.mockResolvedValue(
      ok(
        Account.create(
          mockId,
          "user-02",
          "テストユーザー02",
          "password",
          "mock-uuid-123",
          "Manager"
        )._unsafeUnwrap()
      )
    );
    mockAccountRepository.delete.mockResolvedValue(ok(undefined));

    const result = await userDeleteCommand.execute(mockId, mockActor);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const user = result.value;
      expect(user).toEqual(undefined);
      expect(mockAccountRepository.delete).toHaveBeenCalledWith(mockId);
    }
  });

  it("ロールがManager以下で自分の組織ではない場合", async () => {
    const userDeleteCommand = new UserDeleteCommandImpl(mockAccountRepository);

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-123",
      "Manager"
    )._unsafeUnwrap();
    const mockId = "mock-uuid-user-02";

    mockAccountRepository.findById.mockResolvedValue(
      ok(
        Account.create(
          mockId,
          "user-02",
          "テストユーザー02",
          "password",
          "mock-uuid-456",
          "Manager"
        )._unsafeUnwrap()
      )
    );
    mockAccountRepository.delete.mockResolvedValue(ok(undefined));

    const result = await userDeleteCommand.execute(mockId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(mockAccountRepository.delete).not.toHaveBeenCalled();
    }
  });

  it("データベースエラー", async () => {
    const userDeleteCommand = new UserDeleteCommandImpl(mockAccountRepository);

    const mockActor = Account.create(
      "mock-uuid-user-01",
      "user-01",
      "テストユーザー01",
      "password",
      "mock-uuid-123",
      "Manager"
    )._unsafeUnwrap();
    const mockId = "mock-uuid-user-02";

    mockAccountRepository.findById.mockResolvedValue(
      ok(
        Account.create(
          mockId,
          "user-02",
          "テストユーザー02",
          "password",
          "mock-uuid-123",
          "Manager"
        )._unsafeUnwrap()
      )
    );
    mockAccountRepository.delete.mockResolvedValue(err(new UnexpectedError()));

    const result = await userDeleteCommand.execute(mockId, mockActor);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnexpectedError);
      expect(mockAccountRepository.delete).toHaveBeenCalledWith(mockId);
    }
  });
});
