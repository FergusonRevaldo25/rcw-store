require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const { neon } = require("@neondatabase/serverless");
(async () => {
  console.log("Host:", new URL(process.env.DATABASE_URL).host);
  const sql = neon(process.env.DATABASE_URL);
  const db = await sql`select slug, live from categories order by sort_order`;
  const src = fs.readFileSync("lib/categoryMeta.ts", "utf8");
  const meta = new Set([...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
  const dbSlugs = new Set(db.map((r) => r.slug));
  console.log("In database but not in categoryMeta.ts:", db.filter((r) => !meta.has(r.slug)).map((r) => r.slug));
  console.log("In categoryMeta.ts but not in database:", [...meta].filter((s) => !dbSlugs.has(s)));
  console.log("Live in database:", db.filter((r) => r.live).map((r) => r.slug));
})();
