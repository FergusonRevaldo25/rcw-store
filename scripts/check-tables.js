require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

neon(process.env.DATABASE_URL)
  .query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1",
  )
  .then((rows) => console.log(rows.map((r) => r.table_name).join(", ")))
  .catch((e) => console.error("FAILED:", e.message));
