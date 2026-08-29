// Downloads everything sitting in Vercel Blob under submissions/ into a
// local Submitted/ folder (a sibling to Gallery Originals, not inside it),
// deleting each file from Blob once it's safely written locally. Run this
// whenever you're ready to review what's come in -- nothing auto-processes,
// this just brings the files to you.
import { list, del } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const root = process.cwd();
const submittedRoot = path.join(root, "Submitted");

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN isn't set. Run with --env-file=.env.local.");
  process.exit(1);
}

const { blobs } = await list({ prefix: "submissions/" });
if (blobs.length === 0) {
  console.log("No submissions waiting.");
  process.exit(0);
}

// account_id -> "Name (id)" for a readable, collision-proof folder name.
const accountNames = new Map();
if (process.env.DATABASE_URL) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query("select id, name from accounts");
  for (const row of rows) accountNames.set(String(row.id), row.name);
  await client.end();
}

let pulled = 0;
for (const blob of blobs) {
  // Expect submissions/{accountId}/{filename}
  const parts = blob.pathname.split("/");
  if (parts.length !== 3 || parts[0] !== "submissions") {
    console.warn(`Skipping unexpected blob path: ${blob.pathname}`);
    continue;
  }
  const [, accountId, filename] = parts;
  const label = accountNames.has(accountId) ? `${accountNames.get(accountId)} (${accountId})` : accountId;
  const destDir = path.join(submittedRoot, label);
  await mkdir(destDir, { recursive: true });

  const response = await fetch(blob.url);
  const data = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(destDir, filename), data);
  await del(blob.url);
  pulled += 1;
  console.log(`${label}: ${filename}`);
}

console.log(`\nPulled ${pulled} file(s) into ${submittedRoot}`);
