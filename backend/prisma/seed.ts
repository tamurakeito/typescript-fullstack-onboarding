import { PrismaClient } from "@/generated/prisma/index.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const saltRounds = 10;
async function hashPassword(password: string) {
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  // Authorization
  const superAdminRoleId = uuidv4();
  const managerRoleId = uuidv4();
  const operatorRoleId = uuidv4();
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SuperAdmin" },
    update: {},
    create: {
      id: superAdminRoleId,
      name: "SuperAdmin",
    },
  });
  const managerRole = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: {
      id: managerRoleId,
      name: "Manager",
    },
  });
  const operatorRole = await prisma.role.upsert({
    where: { name: "Operator" },
    update: {},
    create: {
      id: operatorRoleId,
      name: "Operator",
    },
  });
  console.log({ superAdminRole, managerRole, operatorRole });

  const readOrganizationPermissionId = uuidv4();
  const readAllOrganizationPermissionId = uuidv4();
  const createOrganizationPermissionId = uuidv4();
  const updateOrganizationPermissionId = uuidv4();
  const deleteOrganizationPermissionId = uuidv4();
  const readAccountPermissionId = uuidv4();
  const createAccountPermissionId = uuidv4();
  const updateAccountPermissionId = uuidv4();
  const deleteAccountPermissionId = uuidv4();

  const readOrganizationPermission = await prisma.permission.upsert({
    where: { name: "read:Organization" },
    update: {},
    create: {
      id: readOrganizationPermissionId,
      name: "read:Organization",
    },
  });
  const readAllOrganizationPermission = await prisma.permission.upsert({
    where: { name: "readAll:Organization" },
    update: {},
    create: {
      id: readAllOrganizationPermissionId,
      name: "readAll:Organization",
    },
  });
  const createOrganizationPermission = await prisma.permission.upsert({
    where: { name: "create:Organization" },
    update: {},
    create: {
      id: createOrganizationPermissionId,
      name: "create:Organization",
    },
  });
  const updateOrganizationPermission = await prisma.permission.upsert({
    where: { name: "update:Organization" },
    update: {},
    create: {
      id: updateOrganizationPermissionId,
      name: "update:Organization",
    },
  });
  const deleteOrganizationPermission = await prisma.permission.upsert({
    where: { name: "delete:Organization" },
    update: {},
    create: {
      id: deleteOrganizationPermissionId,
      name: "delete:Organization",
    },
  });
  const readAccountPermission = await prisma.permission.upsert({
    where: { name: "read:Account" },
    update: {},
    create: {
      id: readAccountPermissionId,
      name: "read:Account",
    },
  });
  const createAccountPermission = await prisma.permission.upsert({
    where: { name: "create:Account" },
    update: {},
    create: {
      id: createAccountPermissionId,
      name: "create:Account",
    },
  });
  const updateAccountPermission = await prisma.permission.upsert({
    where: { name: "update:Account" },
    update: {},
    create: {
      id: updateAccountPermissionId,
      name: "update:Account",
    },
  });
  const deleteAccountPermission = await prisma.permission.upsert({
    where: { name: "delete:Account" },
    update: {},
    create: {
      id: deleteAccountPermissionId,
      name: "delete:Account",
    },
  });
  console.log({
    readOrganizationPermission,
    readAllOrganizationPermission,
    createOrganizationPermission,
    updateOrganizationPermission,
    deleteOrganizationPermission,
    readAccountPermission,
    createAccountPermission,
    updateAccountPermission,
    deleteAccountPermission,
  });

  const superAdminRoleReadOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: readOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: readOrganizationPermission.id,
    },
  });
  const superAdminRoleReadAllOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: readAllOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: readAllOrganizationPermission.id,
    },
  });
  const superAdminRoleCreateOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: createOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: createOrganizationPermission.id,
    },
  });
  const superAdminRoleUpdateOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: updateOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: updateOrganizationPermission.id,
    },
  });
  const superAdminRoleDeleteOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: deleteOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: deleteOrganizationPermission.id,
    },
  });
  const superAdminRoleReadAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: readAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: readAccountPermission.id,
    },
  });
  const superAdminRoleCreateAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: createAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: createAccountPermission.id,
    },
  });
  const superAdminRoleUpdateAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: updateAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: updateAccountPermission.id,
    },
  });
  const superAdminRoleDeleteAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: superAdminRole.id,
        permissionId: deleteAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      permissionId: deleteAccountPermission.id,
    },
  });
  const managerRoleReadOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: readOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: managerRole.id,
      permissionId: readOrganizationPermission.id,
    },
  });
  const managerRoleReadAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: readAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: managerRole.id,
      permissionId: readAccountPermission.id,
    },
  });
  const managerRoleCreateAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: createAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: managerRole.id,
      permissionId: createAccountPermission.id,
    },
  });
  const managerRoleUpdateAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: updateAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: managerRole.id,
      permissionId: updateAccountPermission.id,
    },
  });
  const managerRoleDeleteAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: managerRole.id,
        permissionId: deleteAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: managerRole.id,
      permissionId: deleteAccountPermission.id,
    },
  });
  const operatorRoleReadOrganizationPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: operatorRole.id,
        permissionId: readOrganizationPermission.id,
      },
    },
    update: {},
    create: {
      roleId: operatorRole.id,
      permissionId: readOrganizationPermission.id,
    },
  });
  const operatorRoleReadAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: operatorRole.id,
        permissionId: readAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: operatorRole.id,
      permissionId: readAccountPermission.id,
    },
  });
  const operatorRoleUpdateAccountPermission = await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: operatorRole.id,
        permissionId: updateAccountPermission.id,
      },
    },
    update: {},
    create: {
      roleId: operatorRole.id,
      permissionId: updateAccountPermission.id,
    },
  });
  console.log({
    superAdminRoleReadOrganizationPermission,
    superAdminRoleReadAllOrganizationPermission,
    superAdminRoleCreateOrganizationPermission,
    superAdminRoleUpdateOrganizationPermission,
    superAdminRoleDeleteOrganizationPermission,
    superAdminRoleReadAccountPermission,
    superAdminRoleCreateAccountPermission,
    superAdminRoleUpdateAccountPermission,
    superAdminRoleDeleteAccountPermission,
    managerRoleReadOrganizationPermission,
    managerRoleReadAccountPermission,
    managerRoleCreateAccountPermission,
    managerRoleUpdateAccountPermission,
    managerRoleDeleteAccountPermission,
    operatorRoleReadOrganizationPermission,
    operatorRoleReadAccountPermission,
    operatorRoleUpdateAccountPermission,
  });

  // Organization
  const organizationId01 = uuidv4();
  const organizationId02 = uuidv4();
  const organization01 = await prisma.organization.upsert({
    where: { id: organizationId01 },
    update: {},
    create: {
      id: organizationId01,
      name: "テスト組織01",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const organization02 = await prisma.organization.upsert({
    where: { id: organizationId02 },
    update: {},
    create: {
      id: organizationId02,
      name: "テスト組織02",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log({ organization01, organization02 });

  // Account
  const superAdmin = await prisma.account.upsert({
    where: { userId: "super-admin" },
    update: {},
    create: {
      id: uuidv4(),
      userId: "super-admin",
      name: "管理　太郎",
      password: await hashPassword("password"),
      organizationId: undefined,
      roleId: superAdminRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const manager = await prisma.account.upsert({
    where: { userId: "manager" },
    update: {},
    create: {
      id: uuidv4(),
      userId: "manager",
      name: "監督　花子",
      password: await hashPassword("password"),
      organizationId: organization01.id,
      roleId: managerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const operator = await prisma.account.upsert({
    where: { userId: "operator" },
    update: {},
    create: {
      id: uuidv4(),
      userId: "operator",
      name: "実働　次郎",
      password: await hashPassword("password"),
      organizationId: organization01.id,
      roleId: operatorRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log({ superAdmin, manager, operator });

  // Todo
  const todoId01 = uuidv4();
  const todoId02 = uuidv4();
  const todoId03 = uuidv4();
  const todoId04 = uuidv4();
  const todo01 = await prisma.todo.upsert({
    where: { id: todoId01 },
    update: {},
    create: {
      id: todoId01,
      title: "テストタスク01",
      description: "テストタスク01の説明",
      organizationId: organization01.id,
      status: "NotStarted",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const todo02 = await prisma.todo.upsert({
    where: { id: todoId02 },
    update: {},
    create: {
      id: todoId02,
      title: "テストタスク02",
      description: "テストタスク02の説明",
      organizationId: organization01.id,
      status: "InProgress",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const todo03 = await prisma.todo.upsert({
    where: { id: todoId03 },
    update: {},
    create: {
      id: todoId03,
      title: "テストタスク03",
      description: "テストタスク03の説明",
      organizationId: organization01.id,
      status: "Completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const todo04 = await prisma.todo.upsert({
    where: { id: todoId04 },
    update: {},
    create: {
      id: todoId04,
      title: "テストタスク04",
      description: "テストタスク04の説明",
      organizationId: organization01.id,
      status: "NotStarted",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log({ todo01, todo02, todo03, todo04 });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
