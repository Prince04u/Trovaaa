import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("ashu9709", 10);
  const phone = "+916201765986";
  
  const user = await prisma.user.findFirst({
    where: { phone }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash }
    });
    console.log(`Password reset successfully for ${phone} to ashu9709`);
  } else {
    // Create the user
    await prisma.user.create({
      data: {
        phone,
        passwordHash: hash,
        displayName: "User3",
      }
    });
    console.log(`Created user ${phone} with password ashu9709`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
