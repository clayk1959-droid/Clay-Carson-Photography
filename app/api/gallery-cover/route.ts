import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
  // Same gate as the other local-editor endpoints: writes to disk, so it
  // must never run outside `next dev`.
  if (process.env.NODE_ENV !== "development") {
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

  const overrides = await readOverrides();
  overrides[slug] = { coverPhoto: filename, coverPosition: position };

  await mkdir(path.dirname(overridesPath), { recursive: true });
  await writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");

  return Response.json({ ok: true });
}
