require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

(async () => {
  const url = process.env.DATABASE_URL;
  console.log("Host:", new URL(url).host);
  const sql = neon(url);

  console.log("\nColumns in pos_sessions:");
  const cols = await sql`
    select column_name, data_type, is_nullable
    from information_schema.columns
    where table_name = 'pos_sessions'
    order by ordinal_position`;
  console.table(cols);

  console.log("\nDirect select:");
  try {
    const rows = await sql`select * from pos_sessions limit 1`;
    console.log("OK, rows:", rows.length);
  } catch (e) {
    console.error("DB ERROR:", e.message);
    if (e.code) console.error("Code:", e.code);
  }

  console.log("\nApplied migrations:");
  try {
    const m = await sql`select id, created_at from drizzle.__drizzle_migrations order by id`;
    console.table(m);
  } catch (e) {
    console.error("Could not read migrations table:", e.message);
  }
})();
