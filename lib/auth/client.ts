import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { cleanUrl } from "./url";

// In the browser the page's own address is always correct, including on
// preview deployments. On the server (build and prerender) use a cleaned value.
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : (cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
  plugins: [twoFactorClient()],
});

export const { useSession, signOut } = authClient;