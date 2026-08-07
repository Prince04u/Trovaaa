const { Client } = require("pg");

const connectionString = "postgresql://neondb_owner:npg_QBZVGgJqe85z@ep-gentle-fire-axs4am5g-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const uid16Id = "dfb942ea-89d5-454d-90da-2d169831a7a0"; // UID 16

  console.log("Setting UID 16 status to SUSPENDED...");

  try {
    const res = await client.query('UPDATE "User" SET status = $1 WHERE id = $2;', ["SUSPENDED", uid16Id]);
    console.log("Status updated successfully! Rows affected:", res.rowCount);
  } catch (err) {
    console.error("Failed to update status. Error:", err);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
