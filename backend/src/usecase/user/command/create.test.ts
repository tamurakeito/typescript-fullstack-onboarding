import {
  DuplicateUserIdError,
  ForbiddenError,
  UnExistOrganizationError,
  UnexpectedError,
} from "@/errors/errors.js";
import { PrismaClient } from "@/generated/prisma/index.js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { UserCreateCommandImpl } from "./create.js";

const mockPrismaClient = {
  account: {
    findUnique: vi.fn(),
  },
  organization: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

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

describe("UserCreateCommandImpl", () => {
  const prisma = new PrismaClient();
  const mockFindUniqueAccount = prisma.account.findUnique;
  const mockFindUniqueOrganization = prisma.organization.findUnique;

  it("SuperAdminで正常にユーザーを作成", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);

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

    mockPrismaClient.account.findUnique.mockResolvedValue(null);
    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: "mock-uuid-123",
    });
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(ok(mockData));

    const result = await userCreateCommand.execute(
      mockUserId,
      mockName,
      "password",
      mockOrganizationId,
      mockRole,
      "SuperAdmin",
      ""
    );
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockData);
      expect(mockFindUniqueAccount).toHaveBeenCalledWith({
        where: { userId: "mock-user-id" },
        select: { id: true },
      });
      expect(mockFindUniqueOrganization).toHaveBeenCalledWith({
        where: { id: "mock-uuid-123" },
        select: { id: true },
      });
    }
  });

  it("Managerで自組織のユーザーを作成", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);

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

    mockPrismaClient.account.findUnique.mockResolvedValue(null);
    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: "mock-uuid-123",
    });
    mockPasswordHash.hash.mockResolvedValue(mockHashedPassword);
    mockAccountRepository.save.mockResolvedValue(ok(mockData));

    const result = await userCreateCommand.execute(
      mockUserId,
      mockName,
      "password",
      mockOrganizationId,
      mockRole,
      "Manager",
      mockOrganizationId
    );
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const account = result.value;
      expect(account).toEqual(mockData);
      expect(mockFindUniqueAccount).toHaveBeenCalledWith({
        where: { userId: "mock-user-id" },
        select: { id: true },
      });
      expect(mockFindUniqueOrganization).toHaveBeenCalledWith({
        where: { id: "mock-uuid-123" },
        select: { id: true },
      });
    }
  });

  it("Managerで他組織のユーザーを作成エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);
    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager",
      "Manager",
      "mock-uuid-124"
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("ManagerでSuperAdminのユーザーを作成エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);
    const mockOrganizationId = "mock-uuid-123";
    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      mockOrganizationId,
      "SuperAdmin",
      "Manager",
      mockOrganizationId
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("Operatorでユーザーを作成エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);
    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Operator",
      "Operator",
      "mock-uuid-123"
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(ForbiddenError);
    }
  });

  it("ユーザーIDが重複している場合エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);

    mockPrismaClient.account.findUnique.mockResolvedValue({
      id: "mock-user-id-other",
    });
    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: "mock-uuid-123",
    });

    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager",
      "SuperAdmin",
      "mock-uuid-123"
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(DuplicateUserIdError);
      expect(mockFindUniqueAccount).toHaveBeenCalledWith({
        where: { userId: "mock-user-id" },
        select: { id: true },
      });
      expect(mockFindUniqueOrganization).toHaveBeenCalledWith({
        where: { id: "mock-uuid-123" },
        select: { id: true },
      });
    }
  });

  it("組織が存在しない場合エラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);

    mockPrismaClient.account.findUnique.mockResolvedValue(null);
    mockPrismaClient.organization.findUnique.mockResolvedValue(null);

    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager",
      "SuperAdmin",
      "mock-uuid-123"
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnExistOrganizationError);
      expect(mockFindUniqueAccount).toHaveBeenCalledWith({
        where: { userId: "mock-user-id" },
        select: { id: true },
      });
      expect(mockFindUniqueOrganization).toHaveBeenCalledWith({
        where: { id: "mock-uuid-123" },
        select: { id: true },
      });
    }
  });

  it("データベースエラー", async () => {
    const userCreateCommand = new UserCreateCommandImpl(mockAccountRepository, mockPasswordHash);

    mockPrismaClient.account.findUnique.mockResolvedValue(null);
    mockPrismaClient.organization.findUnique.mockResolvedValue({
      id: "mock-uuid-123",
    });
    mockPasswordHash.hash.mockResolvedValue("hashed-password");
    mockAccountRepository.save.mockResolvedValue(err(new UnexpectedError("データベースエラー")));

    const result = await userCreateCommand.execute(
      "mock-user-id",
      "テストユーザー",
      "password",
      "mock-uuid-123",
      "Manager",
      "SuperAdmin",
      ""
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error = result.error;
      expect(error).toBeInstanceOf(UnexpectedError);
      expect(mockFindUniqueAccount).toHaveBeenCalledWith({
        where: { userId: "mock-user-id" },
        select: { id: true },
      });
      expect(mockFindUniqueOrganization).toHaveBeenCalledWith({
        where: { id: "mock-uuid-123" },
        select: { id: true },
      });
    }
  });
});
