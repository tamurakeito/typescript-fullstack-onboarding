import type { PasswordHash } from "@/application/services/password-hash.js";
import { Account } from "@/domain/account/account.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { AuthQueryImpl } from "./auth.js";

const mockPrismaClient = {
  account: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

const mockPasswordHash = {
  hash: vi.fn(),
};

vi.mock("@/application/services/password-hash.js", () => ({
  PasswordHash: vi.fn(() => mockPasswordHash),
}));

describe("AuthQueryImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUnique = prisma.account.findUnique;

  it("ユーザーIDとパスワードが一致", async () => {
    const authQuery = new AuthQueryImpl(mockPasswordHash);
    const userId = "test-user";
    const password = "password0123";
    const hashedPassword = "password0123";

    const mockData = {
      id: "mock-uuid-123",
      userId: userId,
      name: "テストユーザー",
      password: hashedPassword,
      organizationId: "org-abc",
      role: "Operator",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrismaClient.account.findUnique.mockResolvedValue(mockData);
    mockPasswordHash.hash.mockResolvedValue(hashedPassword);

    const result = await authQuery.execute(userId, password);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toBeInstanceOf(Account);
      expect(account.userId).toBe(userId);
      expect(account.name).toBe("テストユーザー");
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { userId } });
    }
  });

  it("アカウントが存在しない", async () => {
    const authQuery = new AuthQueryImpl(mockPasswordHash);
    const invalidUserId = "not-exist-user";
    const password = "password0123";

    mockPrismaClient.account.findUnique.mockResolvedValue(null);

    const result = await authQuery.execute(invalidUserId, password);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("ユーザーが見つかりません");
    }
  });

  it("アカウントは存在するがパスワードが一致しない", async () => {
    const authQuery = new AuthQueryImpl(mockPasswordHash);
    const userId = "test-user";
    const invalidPassword = "incorrect-password0123";
    const hashedPassword = "hashed-password0123";
    const invalidHashedPassword = "hashed-incorrect-password";

    const mockData = {
      id: "mock-uuid-123",
      userId: userId,
      name: "テストユーザー",
      password: hashedPassword,
      organizationId: "org-abc",
      role: "Operator",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrismaClient.account.findUnique.mockResolvedValue(mockData);
    mockPasswordHash.hash.mockResolvedValue(invalidHashedPassword);

    const result = await authQuery.execute(userId, invalidPassword);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("パスワードが間違っています");
    }
  });
});
