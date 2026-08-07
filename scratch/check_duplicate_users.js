const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      phone: {
        contains: "6359736842"
      }
    },
    include: {
      wallet: true
    }
  });

  console.log(`Found ${users.length} users with phone containing "6359736842":`);
  users.forEach((u) => {
    console.log(`ID: ${u.id}`);
    console.log(`UID: ${u.uid}`);
    console.log(`Phone: "${u.phone}"`);
    console.log(`Wallet Balance: ${u.wallet?.balance ?? "No Wallet"}`);
    console.log("-----------------------------------------");
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
