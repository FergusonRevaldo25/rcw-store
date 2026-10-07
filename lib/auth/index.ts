import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { db } from "../db";
import { cleanUrl } from "./url";

// Server-only. Check the Better Auth docs if an option name has changed.
export const auth = betterAuth({
  baseURL:
    cleanUrl(process.env.BETTER_AUTH_URL) ??
    cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  // Limits apply in production. Per-instance memory for now (see notes).
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
    },
  },
  session: {
    // Signed in for 7 days, and the clock renews once a day while in use.
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      // "customer" | "seller" | "staff"
      kind: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: false, // users can never set this themselves
      },
      // "active" | "suspended"
      status: {
        type: "string",
        required: true,
        defaultValue: "active",
        input: false,
      },
    },
  },
  plugins: [twoFactor({ issuer: "RCW Store" }), nextCookies()],
});

