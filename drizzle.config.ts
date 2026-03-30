import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  // Drizzle Kit will need this for `push`/`migrate`/`studio`.
  // `generate` can still work without a database connection.
  console.warn("[drizzle.config] DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
