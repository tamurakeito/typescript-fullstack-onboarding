import { PrismaClient } from "@/generated/prisma/index.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const saltRounds = 10;
async function hashPassword(password: string) {
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  const organizationId = "abc-org";
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
      organizationId: organizationId,
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
      organizationId: organizationId,
      role: "Operator",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log({ superAdmin, manager, operator });
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
