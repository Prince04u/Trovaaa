const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const k3 = await prisma.k3ResultOverride.findMany({ take: 1 });
    console.log("K3 ok");
  } catch (e) { console.error("K3 error", e); }
  
  try {
    const fived = await prisma.fiveDResultOverride.findMany({ take: 1 });
    console.log("5D ok");
  } catch (e) { console.error("5D error", e); }
  
  try {
    const wingo = await prisma.resultOverride.findMany({ take: 1 });
    console.log("Wingo ok");
  } catch (e) { console.error("Wingo error", e); }
}

main().finally(() => prisma.$disconnect());
