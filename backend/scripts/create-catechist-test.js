import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
if (process.env.NODE_ENV === "production") {
    throw new Error("The development catechist seed is disabled in production.");
}
const email = process.env.CATECHIST_TEST_EMAIL ?? "catechist@parish.local";
const password = process.env.CATECHIST_TEST_PASSWORD ?? "Catechist@123456";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
try {
    const passwordHash = await bcrypt.hash(password, 12);
    const catechist = await prisma.catechist.upsert({
        where: { email },
        update: { fullName: "Giáo lý viên thử nghiệm", status: "ACTIVE" },
        create: {
            email,
            fullName: "Giáo lý viên thử nghiệm",
            status: "ACTIVE",
        },
    });
    const account = await prisma.userAccount.upsert({
        where: { email },
        update: { passwordHash, role: "CATECHIST", isActive: true, catechistId: catechist.id },
        create: {
            email,
            passwordHash,
            role: "CATECHIST",
            catechistId: catechist.id,
        },
    });
    console.log("Development catechist account ready.");
    console.log({ id: account.id, email, password, role: account.role });
    console.log("Assign this catechist to an ACTIVE class before testing scoped APIs.");
}
finally {
    await prisma.$disconnect();
}
//# sourceMappingURL=create-catechist-test.js.map