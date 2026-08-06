const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");

const pool = new Pool({ 
  connectionString: "postgresql://neondb_owner:npg_QBZVGgJqe85z@ep-gentle-fire-axs4am5g-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.predictionTemplate.updateMany({
    data: {
      fields: {},
    },
  });
  console.log("Cleared header fields for prediction templates:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
