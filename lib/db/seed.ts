import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import { permissions, rolePermissions, roles } from "./schema";
import { ALL_PERMISSIONS } from "../rbac/permissions";
import { STARTER_ROLES } from "../rbac/roles";

// Safe to run again: permissions are updated, roles and grants are only added.
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");
  const db = drizzle(neon(url));

  await db
    .insert(permissions)
    .values(ALL_PERMISSIONS)
    .onConflictDoUpdate({
      target: permissions.key,
      set: {
        module: sql`excluded.module`,
        action: sql`excluded.action`,
        description: sql`excluded.description`,
        sensitive: sql`excluded.sensitive`,
      },
    });
  console.log(`Permissions: ${ALL_PERMISSIONS.length}`);

  for (const def of STARTER_ROLES) {
    await db
      .insert(roles)
      .values({
        key: def.key,
        name: def.name,
        description: def.description,
        isSystem: true,
      })
      .onConflictDoNothing({ target: roles.key });

    const [row] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.key, def.key));

    await db
      .insert(rolePermissions)
      .values(
        def.permissions.map((permissionKey) => ({
          roleId: row.id,
          permissionKey,
          scope: "all" as const,
        }))
      )
      .onConflictDoNothing();

    console.log(`Role: ${def.name} (${def.permissions.length} permissions)`);
  }
  console.log("Seed finished.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
