import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRemoteEditorMode } from "../../../lib/editor-mode";
import { applyRemoteEdit } from "../../../lib/remote-editor";

export const dynamic = "force-dynamic";

const overridesPath = path.join(process.cwd(), "data", "collection-overrides.json");

const VALID_POSITIONS = new Set([
  "left top",
  "center top",
  "right top",
  "left center",
  "center center",
  "right center",
  "left bottom",
  "center bottom",
  "right bottom",
]);

type CollectionOverrides = Record<string, { coverPhoto: string; coverPosition: string }>;

async function readOverrides(): Promise<CollectionOverrides> {
  try {
    return JSON.parse(await readFile(overridesPath, "utf8"));
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  // Same gate as the other editor endpoints: writes to disk locally, or
  // commits to GitHub in remote mode — never plain production.
  const remote = isRemoteEditorMode();
  if (process.env.NODE_ENV !== "development" && !remote) {
    return new Response("Not found", { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { slug, filename, position } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }
  if (typeof filename !== "string" || filename.length === 0 || filename.length > 255) {
    return new Response("Invalid filename", { status: 400 });
  }
  if (typeof position !== "string" || !VALID_POSITIONS.has(position)) {
    return new Response("Invalid position", { status: 400 });
  }

  try {
    if (remote) {
      await applyRemoteEdit(
        slug,
        ({ coverOverrides }) => {
          // Merge, don't replace -- this object also carries firstSyncedAt
          // and pinnedAt (set elsewhere), which a wholesale overwrite here
          // would silently wipe every time a cover photo changes.
          coverOverrides[slug] = { ...(coverOverrides[slug] ?? {}), coverPhoto: filename, coverPosition: position };
        },
        `Editor: set cover of ${slug} to ${filename}`,
      );
    } else {
      const overrides = await readOverrides();
      overrides[slug] = { ...(overrides[slug] ?? {}), coverPhoto: filename, coverPosition: position };

      await mkdir(path.dirname(overridesPath), { recursive: true });
      await writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
    }
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Something went wrong", { status: 500 });
  }

  return Response.json({ ok: true });
}
