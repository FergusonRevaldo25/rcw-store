# RCW launch checklist

Tick each line only when it is done and checked.

## 1. Before merging to main
- [ ] Sample tabs hidden (`built: false`) and the sample route returns 404 for them
- [ ] `/terms`, `/privacy`, `/deals`, `/orders` exist, or their links are removed
- [ ] Business address, VAT status and VAT number confirmed with the accountant and entered
- [ ] Product checklist passed (upload, link import, refusals, self-publish, second-person approval, stock, take offline)
- [ ] POS checklist passed (cash, card, EFT, print, close till, cashier role)
- [ ] Sign out lands on /admin/login; View store opens in a new tab
- [ ] `git ls-files | Select-String "\.env"` prints nothing
- [ ] No `scripts\*.backup.txt`, share-dump or check-pos.js in the commit

## 2. Production settings in Vercel (Production scope only)
- [ ] DATABASE_URL and DATABASE_URL_UNPOOLED point at the main database (not ep-gentle-field)
- [ ] BETTER_AUTH_SECRET is new and different from dev
- [ ] BETTER_AUTH_URL and NEXT_PUBLIC_SITE_URL are the real https domain
- [ ] BLOB_READ_WRITE_TOKEN and BLOB_STORE_ID (a separate production Blob store is best)
- [ ] Production branch in Vercel is `main`

## 3. Main database (use .env.main.local, which is git-ignored)
- [ ] Host checked before every command
- [ ] Migrations run
- [ ] Seed roles, permissions and categories only (no test products)
- [ ] `admin:promote` for the owner account
- [ ] `scripts/audit-trigger-main.js` run (needs ENV_FILE and EXPECT_HOST)
- [ ] Main database password reset after setup
- [ ] Neon's own Better Auth service disabled

## 4. Go live
- [ ] Merge feature/admin-foundation into main through a pull request
- [ ] Production build is green
- [ ] Custom domain connected, https works
- [ ] Smoke test: /admin/login, 2FA code, backup codes saved in a password manager
- [ ] Smoke test: one till sale, one receipt, one stock check, audit log shows the sale

## 5. Decide before public sign-ups
- [ ] Email verification and password reset exist, or sign-up is held back
- [ ] Rate limiting on login and image import
- [ ] Checkout (PayFast or Ozow) built, or the store stays "coming soon"