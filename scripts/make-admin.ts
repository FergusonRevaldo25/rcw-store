import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { roles, user, userRoles } from "../lib/db/schema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run admin:promote -- you@example.com");

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");
  console.log(`Host: ${new URL(url).host}`);

  const db = drizzle(neon(url));

  const [u] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (!u) throw new Error(`No account for ${email}. Sign up first.`);

  const [r] = await db.select({ id: roles.id }).from(roles).where(eq(roles.key, "super_admin"));
  if (!r) throw new Error("Super Admin role missing. Run npm run db:seed first.");

  await db.update(user).set({ kind: "staff" }).where(eq(user.id, u.id));
  await db
    .insert(userRoles)
    .values({ userId: u.id, roleId: r.id, grantedBy: u.id })
    .onConflictDoNothing();

  console.log(`${email} is now staff with the Super Admin role.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});