// Safety net: unit tests must never be able to reach a real database.
// Vitest does not load .env.local, but this removes the variables in case
// they are set in the shell, so a test can never touch dev or main.
for (const name of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NO_SSL",
]) {
  delete process.env[name];
}
