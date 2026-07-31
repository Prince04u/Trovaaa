import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("Database connection successful!");
  console.log(`Found ${users.length} user(s) in the database:`);
  users.forEach((user) => {
    console.log(`- Phone: ${user.phone}, Role: ${user.role}, Name: ${user.displayName}`);
  });

  const bets = await prisma.wingoBet?.count().catch(() => 0);
  console.log(`Total Wingo bets: ${bets}`);

  const txs = await prisma.walletLedger?.count().catch(() => 0);
  console.log(`Total Wallet Ledger logs: ${txs}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
