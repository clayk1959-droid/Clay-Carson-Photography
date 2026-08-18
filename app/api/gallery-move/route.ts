import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const root = process.cwd();
const collectionsManifestPath = path.join(root, ".cache", "gallery-sync", "collections.json");
const galleryOriginalsRoot = path.join(root, "Gallery Originals");
const overridesPath = path.join(root, "data", "gallery-overrides.json");

type CollectionInfo = { slug: string; folder: string; title: string };

async function readCollections(): Promise<CollectionInfo[]> {
  return JSON.parse(await readFile(collectionsManifestPath, "utf8"));
}

async function fileExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // Same gate as the other local-editor endpoints, but doubly important
  // here: this one moves real photo files on disk.
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

  const { fromSlug, toSlug, filename } = body as Record<string, unknown>;

  if (typeof fromSlug !== "string" || typeof toSlug !== "string" || typeof filename !== "string") {
    return new Response("Invalid request", { status: 400 });
  }
  if (fromSlug === toSlug) {
    return new Response("Photo is already in that gallery", { status: 400 });
  }
  if (filename.length === 0 || filename.length > 255) {
    return new Response("Invalid filename", { status: 400 });
  }

  let collections: CollectionInfo[];
  try {
    collections = await readCollections();
  } catch {
    return new Response(
      "Collections list not found — run `npm run gallery:sync` at least once first.",
      { status: 400 },
    );
  }

  const from = collections.find((collection) => collection.slug === fromSlug);
  const to = collections.find((collection) => collection.slug === toSlug);
  if (!from || !to) {
    return new Response("Unknown gallery", { status: 400 });
  }

  const sourcePath = path.join(galleryOriginalsRoot, from.folder, filename);
  const destinationPath = path.join(galleryOriginalsRoot, to.folder, filename);

  if (!(await fileExists(sourcePath))) {
    return new Response(`Couldn't find "${filename}" in ${from.title}.`, { status: 404 });
  }
  if (await fileExists(destinationPath)) {
    return new Response(
      `"${filename}" already exists in ${to.title} — rename one of them first.`,
      { status: 409 },
    );
  }

  await mkdir(path.join(galleryOriginalsRoot, to.folder), { recursive: true });
  await rename(sourcePath, destinationPath);

  // Caption/date/order overrides (especially order) don't carry meaning in
  // the new collection, so drop them rather than leave stale state behind.
  try {
    const overrides = JSON.parse(await readFile(overridesPath, "utf8"));
    if (overrides[fromSlug]?.[filename]) {
      delete overrides[fromSlug][filename];
      if (Object.keys(overrides[fromSlug]).length === 0) delete overrides[fromSlug];
      await writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
    }
  } catch {
    // No overrides file yet, or nothing to clean up — fine either way.
  }

  return Response.json({ ok: true, fromTitle: from.title, toTitle: to.title });
}
