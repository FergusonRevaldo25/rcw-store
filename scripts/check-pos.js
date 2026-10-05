require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

(async () => {
  const url = process.env.DATABASE_URL;
  console.log("Host:", new URL(url).host);
  const sql = neon(url);

  try {
    const cols = await sql`
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_name = 'pos_sessions'
      order by ordinal_position`;
    console.log("pos_sessions columns:");
    console.table(cols);
  } catch (e) {
    console.error("columns query failed:", e.message);
  }

  try {
    const rows = await sql`select * from pos_sessions limit 5`;
    console.log("select * worked, rows:", rows.length);
  } catch (e) {
    console.error("select failed:", e.message, e.code ?? "", e.detail ?? "");
  }

  try {
    const m = await sql`select id, created_at from drizzle.__drizzle_migrations order by id`;
    console.log("applied migrations:", m.length);
    console.table(m);
  } catch (e) {
    console.error("migrations table:", e.message);
  }
})();