import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { generateDisplayName, generateAvatarSeed, generateReferralCode } from "../lib/auth/identity";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const phone = "9999999999";
  const password = "123456";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({ where: { phone } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    console.log(`Updated existing user: ${phone} password to: ${password}`);
  } else {
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        role: "SUPER_ADMIN",
        displayName: generateDisplayName(),
        avatarSeed: generateAvatarSeed(),
        referralCode: generateReferralCode(),
      },
    });
    await prisma.wallet.create({ data: { userId: user.id, balance: 10000.00 } });
    console.log(`Created new super admin user: ${phone} password: ${password} with wallet balance: 10000.00`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
