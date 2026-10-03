import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { db } from "../db";

// Server-only. Check the Better Auth docs if an option name has changed.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
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
