require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const url = process.env.DATABASE_URL;
const host = new URL(url).host;
console.log("Host:", host);
if (!host.includes("ep-gentle-field")) {
  console.error("Refusing to run: this is not the dev database.");
  process.exit(1);
}
const sql = neon(url);
const run = (s) => (sql.query ? sql.query(s) : sql(s));

(async () => {
  await run(`create or replace function audit_log_block_change() returns trigger language plpgsql as $$
    begin raise exception 'audit_log is append-only'; end; $$`);
  await run(`drop trigger if exists audit_log_no_update_delete on audit_log`);
  await run(`create trigger audit_log_no_update_delete before update or delete on audit_log
    for each row execute function audit_log_block_change()`);
  await run(`drop trigger if exists audit_log_no_truncate on audit_log`);
  await run(`create trigger audit_log_no_truncate before truncate on audit_log
    for each statement execute function audit_log_block_change()`);
  console.log("Trigger installed.");

  // Each attempt runs in a transaction, so a blocked change rolls back the test row too.
  for (const [name, stmt] of [
    ["update", (id) => sql`update audit_log set action = 'x' where id = ${id}`],
    ["delete", (id) => sql`delete from audit_log where id = ${id}`],
  ]) {
    const id = crypto.randomUUID();
    let blocked = false;
    try {
      await sql.transaction([
        sql`insert into audit_log (id, action) values (${id}, 'trigger.test')`,
        stmt(id),
      ]);
    } catch (e) {
      blocked = /append-only/.test(String(e.message));
    }
    console.log(name, blocked ? "BLOCKED (good)" : "NOT BLOCKED (bad)");
  }
})();