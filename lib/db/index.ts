import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Server-only. Never import this file from a "use client" component.
// DATABASE_URL has no NEXT_PUBLIC_ prefix, so it is never sent to the browser.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export const db = drizzle(neon(url), { schema });
