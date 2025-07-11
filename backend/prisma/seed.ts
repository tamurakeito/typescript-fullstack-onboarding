import { PrismaClient } from "@/generated/prisma/index.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const saltRounds = 10;
async function hashPassword(password: string) {
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  const organizationId01 = uuidv4();
  const organizationId02 = uuidv4();
  const superAdmin = await prisma.account.upsert({
    where: { userId: "super-admin" },
    update: {},
    create: {
      id: uuidv4(),
      userId: "super-admin",
      name: "管理　太郎",
      password: await hashPassword("password"),
      organizationId: undefined,
      role: "SuperAdmin",
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
      organizationId: organizationId01,
      role: "Manager",
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
      organizationId: organizationId01,
      role: "Operator",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log({ superAdmin, manager, operator });
  const organization01 = await prisma.organization.upsert({
    where: { id: organizationId01 },
    update: {},
    create: {
      id: organizationId01,
      name: "テスト組織",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const organization02 = await prisma.organization.upsert({
    where: { id: organizationId02 },
    update: {},
    create: {
      id: organizationId02,
      name: "テスト組織",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log({ organization01, organization02 });
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
