import { isRemoteEditorMode } from "../../../lib/editor-mode";
import { applyBatchRemote, type PendingEdit } from "../../../lib/remote-editor";
import { getLoggedInEditorName } from "../../../lib/session-cookie";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]+$/;
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string" && entry.length > 0 && entry.length <= 100);
}

function validFilename(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 255;
}

// Mirrors the validation each individual editor route already does for its
// own action -- this endpoint replaces all of them for remote-mode edits,
// so it needs the same guarantees before anything reaches applyBatchRemote.
function validateEdit(edit: unknown): PendingEdit | null {
  if (typeof edit !== "object" || edit === null) return null;
  const e = edit as Record<string, unknown>;
  if (typeof e.key !== "string" || e.key.length === 0) return null;
  if (typeof e.slug !== "string" || !SLUG_RE.test(e.slug)) return null;
  if (typeof e.label !== "string") return null;

  switch (e.type) {
    case "pin":
      if (typeof e.pinned !== "boolean") return null;
      return { key: e.key, type: "pin", slug: e.slug, pinned: e.pinned, label: e.label };

    case "privacy":
      if (typeof e.private !== "boolean") return null;
      return { key: e.key, type: "privacy", slug: e.slug, private: e.private, label: e.label };

    case "cover":
      if (!validFilename(e.filename)) return null;
      if (typeof e.position !== "string" || !VALID_POSITIONS.has(e.position)) return null;
      return { key: e.key, type: "cover", slug: e.slug, filename: e.filename, position: e.position, label: e.label };

    case "reorder":
      if (!isStringArray(e.filenames) || e.filenames.length === 0) return null;
      return { key: e.key, type: "reorder", slug: e.slug, filenames: e.filenames, label: e.label };

    case "photoHidden":
      if (!validFilename(e.filename)) return null;
      if (typeof e.hidden !== "boolean") return null;
      return { key: e.key, type: "photoHidden", slug: e.slug, filename: e.filename, hidden: e.hidden, label: e.label };

    case "photoFields": {
      if (!validFilename(e.filename)) return null;
      if (typeof e.caption !== "string" || e.caption.trim().length === 0 || e.caption.length > 500) return null;
      if (e.date !== null && (typeof e.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date))) return null;
      if (typeof e.order !== "number" || !Number.isInteger(e.order) || e.order < 1) return null;
      if (!isStringArray(e.person)) return null;
      if (!isStringArray(e.event)) return null;
      return {
        key: e.key,
        type: "photoFields",
        slug: e.slug,
        filename: e.filename,
        caption: e.caption.trim(),
        date: e.date as string | null,
        order: e.order,
        person: e.person,
        event: e.event,
        label: e.label,
      };
    }

    default:
      return null;
  }
}

export async function POST(request: Request) {
  if (!isRemoteEditorMode()) return new Response("Not found", { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (typeof body !== "object" || body === null || !Array.isArray((body as Record<string, unknown>).edits)) {
    return new Response("Invalid request body", { status: 400 });
  }

  const rawEdits = (body as Record<string, unknown>).edits as unknown[];
  if (rawEdits.length === 0) {
    return Response.json({ error: "No changes to sync." }, { status: 400 });
  }

  const edits: PendingEdit[] = [];
  for (const rawEdit of rawEdits) {
    const edit = validateEdit(rawEdit);
    if (!edit) return new Response("Invalid edit in batch", { status: 400 });
    edits.push(edit);
  }

  try {
    const editorName = await getLoggedInEditorName(request);
    await applyBatchRemote(edits, editorName);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, count: edits.length });
}
