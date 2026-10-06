// Installs the append-only audit log trigger on the PRODUCTION database.
// Usage (PowerShell):
//   $env:ENV_FILE = ".env.main.local"
//   $env:EXPECT_HOST = "ep-xxxx"        # part of your main host name
//   node scripts/audit-trigger-main.js
require("dotenv").config({ path: process.env.ENV_FILE });
const { neon } = require("@neondatabase/serverless");

const url = process.env.DATABASE_URL;
const expect = process.env.EXPECT_HOST;
if (!url || !expect || !process.env.ENV_FILE) {
  console.error("Set ENV_FILE and EXPECT_HOST first. See the comment at the top.");
  process.exit(1);
}
const host = new URL(url).host;
console.log("Host:", host);
if (host.includes("ep-gentle-field")) {
  console.error("Refusing: this is the DEV database.");
  process.exit(1);
}
if (!host.includes(expect)) {
  console.error("Refusing: host does not contain EXPECT_HOST.");
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
  console.log("Trigger installed on production.");
  // No test rows are written here, so production stays clean.
})();