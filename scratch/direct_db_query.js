const { Client } = require("pg");

const connectionString = "postgresql://neondb_owner:npg_QBZVGgJqe85z@ep-gentle-fire-axs4am5g-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Querying UID 7 and UID 16...");

  const res = await client.query('SELECT id, uid, phone, "displayName" FROM "User" WHERE uid IN (7, 16);');
  
  console.log(`Found ${res.rows.length} rows:`);
  for (const row of res.rows) {
    console.log(`ID: ${row.id}`);
    console.log(`UID: ${row.uid}`);
    console.log(`Phone: "${row.phone}"`);
    console.log(`DisplayName: "${row.displayName}"`);

    // Fetch wallet balance
    const walletRes = await client.query('SELECT balance FROM "Wallet" WHERE "userId" = $1;', [row.id]);
    const balance = walletRes.rows[0] ? walletRes.rows[0].balance : "No Wallet";
    console.log(`Wallet Balance: ${balance}`);
    console.log("-----------------------------------------");
  }

  await client.end();
}

main().catch(console.error);
