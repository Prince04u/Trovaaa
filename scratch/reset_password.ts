import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("Password123!", 10);
  await prisma.user.update({
    where: { phone: "8888888888" },
    data: { passwordHash: hash }
  });
  console.log("Password reset successfully for 8888888888 to Password123!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
