const { Client } = require("pg");

const connectionString = "postgresql://neondb_owner:npg_QBZVGgJqe85z@ep-gentle-fire-axs4am5g-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const uid16Id = "dfb942ea-89d5-454d-90da-2d169831a7a0"; // UID 16
  const uid7Id = "5a6a81be-129a-4cc8-9d4d-df4a72931281";  // UID 7

  console.log("Starting transaction to rename UID 16's phone and assign correct phone to UID 7...");

  try {
    await client.query("BEGIN");

    // 1. Rename the phone of UID 16 to free up the correct 10-digit number
    console.log("Renaming phone of UID 16 to +916359736842_deleted...");
    await client.query('UPDATE "User" SET phone = $1, "displayName" = $2 WHERE id = $3;', ["+916359736842_deleted", "Deleted Account", uid16Id]);

    // 2. Update UID 7's phone to the correct 10-digit number
    console.log("Updating phone number of UID 7 to +916359736842...");
    await client.query('UPDATE "User" SET phone = $1 WHERE id = $2;', ["+916359736842", uid7Id]);

    await client.query("COMMIT");
    console.log("Migration successful! Transaction committed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed, transaction rolled back. Error:", err);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
