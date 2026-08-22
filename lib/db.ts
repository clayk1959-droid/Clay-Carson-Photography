import { Pool } from "pg";

let pool: Pool | undefined;

// One pooled connection reused across invocations -- Neon's pooled
// connection string (DATABASE_URL) is designed for exactly this pattern
// in a serverless environment.
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
