import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const overridesPath = path.join(process.cwd(), "data", "gallery-overrides.json");

type PhotoOverride = { caption?: string; date?: string; order?: number; hidden?: boolean };
type Overrides = Record<string, Record<string, PhotoOverride>>;

async function readOverrides(): Promise<Overrides> {
  try {
    return JSON.parse(await readFile(overridesPath, "utf8"));
  } catch {
    return {};
  }
}

function sortedEntries<T>(object: Record<string, T>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of Object.keys(object).sort()) {
    result[key] = object[key];
  }
  return result;
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

  const { slug, filenames } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }
  if (
    !Array.isArray(filenames) ||
    filenames.length === 0 ||
    !filenames.every((filename) => typeof filename === "string" && filename.length > 0)
  ) {
    return new Response("Invalid filenames", { status: 400 });
  }

  const overrides = await readOverrides();
  const collectionOverrides = { ...(overrides[slug] ?? {}) };

  filenames.forEach((filename: string, index: number) => {
    const existing = collectionOverrides[filename] ?? {};
    collectionOverrides[filename] = { ...existing, order: index + 1 };
  });

  overrides[slug] = sortedEntries(collectionOverrides);

  await mkdir(path.dirname(overridesPath), { recursive: true });
  await writeFile(
    overridesPath,
    `${JSON.stringify(sortedEntries(overrides), null, 2)}\n`,
    "utf8",
  );

  return Response.json({ ok: true });
}
