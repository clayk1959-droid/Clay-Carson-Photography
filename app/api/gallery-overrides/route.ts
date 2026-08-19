import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRemoteEditorMode } from "../../../lib/editor-mode";
import { applyRemoteEdit } from "../../../lib/remote-editor";
import { formatDate } from "../../../scripts/lib/format-date.mjs";

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
  // The real gate: outside development this endpoint writes to disk (or,
  // in remote mode, commits to GitHub) so it must never run against a
  // plain production build (Vercel always sets NODE_ENV=production; only
  // `next dev` sets development, and EDITOR_MODE=remote is set on nothing
  // but the password-protected remote editor project). The pencil icon
  // that calls this is also hidden server-side outside both of those —
  // this is the second, independent check.
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

  const { slug, filename, caption, date, order, reset, hidden } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }
  if (typeof filename !== "string" || filename.length === 0 || filename.length > 255) {
    return new Response("Invalid filename", { status: 400 });
  }

  if (reset === true && remote) {
    // "Reset to auto-detected" needs the full-resolution originals, which
    // only exist on the owner's own Mac — the editor UI already hides this
    // button in remote mode, so reaching this is not a normal user action.
    return new Response("Not available remotely", { status: 400 });
  }

  let entry: PhotoOverride | null = null;
  if (reset !== true && hidden !== true) {
    entry = {};

    if (caption !== undefined) {
      if (typeof caption !== "string" || caption.trim().length === 0 || caption.length > 500) {
        return new Response("Invalid caption", { status: 400 });
      }
      entry.caption = caption.trim();
    }

    if (date !== undefined && date !== null) {
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response("Invalid date", { status: 400 });
      }
      entry.date = date;
    }

    if (order !== undefined) {
      if (typeof order !== "number" || !Number.isInteger(order) || order < 1) {
        return new Response("Invalid order", { status: 400 });
      }
      entry.order = order;
    }

    if (Object.keys(entry).length === 0) {
      return new Response("No changes provided", { status: 400 });
    }
  }

  try {
    if (remote) {
      await applyRemoteEdit(
        slug,
        ({ collectionOverrides, photoData }) => {
          const photoIndex = photoData.photographData.findIndex((photo) => photo.filename === filename);
          if (photoIndex === -1) throw new Error("Unknown photo");

          if (hidden === true) {
            const existing = collectionOverrides[filename] ?? {};
            collectionOverrides[filename] = { ...existing, hidden: true };
            photoData.photographData[photoIndex] = {
              filename,
              date: null,
              description: "",
              caption: "",
              altText: "",
              person: [],
              event: [],
              width: 0,
              height: 0,
            };
            return;
          }

          collectionOverrides[filename] = { ...collectionOverrides[filename], ...entry };

          const photo = photoData.photographData[photoIndex];
          if (entry?.caption !== undefined) {
            photo.description = entry.caption;
            photo.altText = entry.caption;
          }
          if (entry?.date !== undefined) {
            photo.date = entry.date;
          }
          photo.caption = photo.date ? `${formatDate(photo.date)} — ${photo.description}` : photo.description;
        },
        `Editor: update ${filename} in ${slug}`,
      );
    } else {
      const overrides = await readOverrides();

      if (reset === true) {
        delete overrides[slug]?.[filename];
        if (overrides[slug] && Object.keys(overrides[slug]).length === 0) {
          delete overrides[slug];
        }
      } else if (hidden === true) {
        // Hide the photo from the site without touching any caption/date/order
        // overrides already set for it — "Reset to auto-detected" is what
        // un-hides (and clears everything else too).
        const existing = overrides[slug]?.[filename] ?? {};
        overrides[slug] = sortedEntries({ ...overrides[slug], [filename]: { ...existing, hidden: true } });
      } else {
        overrides[slug] = sortedEntries({ ...overrides[slug], [filename]: entry as PhotoOverride });
      }

      await mkdir(path.dirname(overridesPath), { recursive: true });
      await writeFile(overridesPath, `${JSON.stringify(sortedEntries(overrides), null, 2)}\n`, "utf8");
    }
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Something went wrong", { status: 500 });
  }

  return Response.json({ ok: true });
}
