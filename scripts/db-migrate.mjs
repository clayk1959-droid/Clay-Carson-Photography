// Applies db/schema.sql to the database in DATABASE_URL. Safe to re-run --
// every statement in schema.sql is idempotent (CREATE ... IF NOT EXISTS).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(here, "..", "db", "schema.sql");

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL isn't set. Run this with your .env.local loaded, e.g.:\n" +
      "  node --env-file=.env.local scripts/db-migrate.mjs",
  );
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(readFileSync(schemaPath, "utf8"));
const { rows } = await client.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
);
console.log("Schema applied. Tables:", rows.map((r) => r.table_name).join(", "));
await client.end();
