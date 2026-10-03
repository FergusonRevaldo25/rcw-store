import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Direct (unpooled) connection: migrations need it.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
