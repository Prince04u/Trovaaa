import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";
import { generateDisplayName, generateAvatarSeed, generateReferralCode } from "../lib/auth/identity";

async function main() {
  const phone = "8888888888";
  const password = "password123";
  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findFirst({ where: { phone } });
  if (existing) {
    // If the user already exists, let's reset their password and verify their wallet
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: existing.id } });
    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: 50000 },
      });
    } else {
      await prisma.wallet.create({ data: { userId: existing.id, balance: 50000 } });
    }
    console.log(`Updated existing demo user: ${phone} password to: ${password} with balance: ₹50,000.00`);
  } else {
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        role: "USER",
        displayName: generateDisplayName(),
        avatarSeed: generateAvatarSeed(),
        referralCode: generateReferralCode(),
      },
    });
    await prisma.wallet.create({ data: { userId: user.id, balance: 50000 } });
    console.log(`Created new demo user: ${phone} password: ${password} with wallet balance: ₹50,000.00`);
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
