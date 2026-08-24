import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRemoteEditorMode } from "../../../lib/editor-mode";
import { applyPinRemote } from "../../../lib/remote-editor";
import { getLoggedInEditorName } from "../../../lib/session-cookie";

export const dynamic = "force-dynamic";

const overridesPath = path.join(process.cwd(), "data", "collection-overrides.json");

type CoverOverride = { coverPhoto?: string; coverPosition?: string; firstSyncedAt?: string; pinnedAt?: string };
type CollectionOverrides = Record<string, CoverOverride>;

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

  const { slug } = body as Record<string, unknown>;
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }

  try {
    if (remote) {
      const editorName = await getLoggedInEditorName(request);
      const { pinned } = await applyPinRemote(slug, editorName);
      return Response.json({ ok: true, pinned });
    }

    const overrides = await readOverrides();
    const existing = overrides[slug] ?? {};
    const nowPinned = !existing.pinnedAt;
    if (nowPinned) {
      overrides[slug] = { ...existing, pinnedAt: new Date().toISOString() };
    } else {
      const { pinnedAt: _pinnedAt, ...rest } = existing;
      overrides[slug] = rest;
    }

    await mkdir(path.dirname(overridesPath), { recursive: true });
    await writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");

    // Local mode doesn't rebuild _index.json here (matching the other
    // editor routes) -- the card order updates on the next "Sync Gallery".
    return Response.json({ ok: true, pinned: nowPinned, requiresSync: true });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Something went wrong", { status: 500 });
  }
}
