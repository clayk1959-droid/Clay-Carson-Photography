import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

export const dynamic = "force-dynamic";
export const maxDuration = 600;

const run = promisify(execFile);
const root = process.cwd();

export async function POST() {
  // Same gate as /api/gallery-overrides: this triggers a build-time script
  // that writes into the repo, so it must never run outside local dev.
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { stdout } = await run("node", [path.join("scripts", "sync-gallery.mjs")], {
      cwd: root,
      maxBuffer: 10 * 1024 * 1024,
    });
    return Response.json({ ok: true, output: stdout.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    return Response.json({ ok: false, output: message }, { status: 500 });
  }
}
