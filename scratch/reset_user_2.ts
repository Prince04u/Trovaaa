import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("123456", 10);
  const phone = "+916204480457";
  
  const user = await prisma.user.findFirst({
    where: { phone }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash }
    });
    console.log(`Password reset successfully for ${phone} to 123456`);
  } else {
    // Create the user
    await prisma.user.create({
      data: {
        phone,
        passwordHash: hash,
        displayName: "User2",
      }
    });
    console.log(`Created user ${phone} with password 123456`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
