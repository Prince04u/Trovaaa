import { prisma } from "../lib/prisma";

async function main() {
  const otps = await prisma.otp.findMany({});
  console.log("Active OTP records in database:", JSON.stringify(otps, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
