const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['STAFF', 'SUPER_ADMIN'] } },
    select: { phone: true, email: true, role: true }
  });
  console.log('Admins:', admins);
}
main().catch(console.error).finally(() => prisma.$disconnect());
