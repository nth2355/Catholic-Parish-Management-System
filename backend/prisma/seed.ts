import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.userAccount.upsert({
    where: {
      email: "admin@parish.local",
    },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: "admin@parish.local",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin account created:");
  console.log({
    id: admin.id,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
