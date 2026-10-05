require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  console.log("Host:", new URL(process.env.DATABASE_URL).host);
  const cols = await sql`
    select column_name from information_schema.columns
    where table_name = 'refunds' and column_name in ('pos_session_id','paid_at')`;
  console.table(cols);
  const m = await sql`select id from drizzle.__drizzle_migrations order by id`;
  console.log("Migrations applied:", m.length, "(expect 6)");
})();
