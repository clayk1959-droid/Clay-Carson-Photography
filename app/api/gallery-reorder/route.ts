import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRemoteEditorMode } from "../../../lib/editor-mode";
import { applyRemoteEdit } from "../../../lib/remote-editor";
import { getLoggedInEditorName } from "../../../lib/session-cookie";

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

  try {
    if (remote) {
      const editorName = await getLoggedInEditorName(request);
      await applyRemoteEdit(
        slug,
        ({ collectionOverrides }) => {
          (filenames as string[]).forEach((filename, index) => {
            const existing = collectionOverrides[filename] ?? {};
            collectionOverrides[filename] = { ...existing, order: index + 1 };
          });
        },
        `Editor${editorName ? ` (${editorName})` : ""}: reorder photos in ${slug}`,
      );
    } else {
      const overrides = await readOverrides();
      const collectionOverrides = { ...(overrides[slug] ?? {}) };

      filenames.forEach((filename: string, index: number) => {
        const existing = collectionOverrides[filename] ?? {};
        collectionOverrides[filename] = { ...existing, order: index + 1 };
      });

      overrides[slug] = sortedEntries(collectionOverrides);

      await mkdir(path.dirname(overridesPath), { recursive: true });
      await writeFile(overridesPath, `${JSON.stringify(sortedEntries(overrides), null, 2)}\n`, "utf8");
    }
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Something went wrong", { status: 500 });
  }

  return Response.json({ ok: true });
}
