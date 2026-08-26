import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRemoteEditorMode } from "../../../lib/editor-mode";
import { applyPrivacyRemote } from "../../../lib/remote-editor";
import { getLoggedInEditorName } from "../../../lib/session-cookie";

export const dynamic = "force-dynamic";

const overridesPath = path.join(process.cwd(), "data", "collection-overrides.json");

type CoverOverride = {
  coverPhoto?: string;
  coverPosition?: string;
  firstSyncedAt?: string;
  pinnedAt?: string;
  private?: boolean;
};
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
      const result = await applyPrivacyRemote(slug, editorName);
      return Response.json({ ok: true, ...result, requiresSync: true });
    }

    const overrides = await readOverrides();
    const existing = overrides[slug] ?? {};
    const nowPrivate = !existing.private;
    if (nowPrivate) {
      overrides[slug] = { ...existing, private: true };
    } else {
      const { private: _private, ...rest } = existing;
      overrides[slug] = rest;
    }

    await mkdir(path.dirname(overridesPath), { recursive: true });
    await writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");

    // Neither mode moves images or regenerates the gated page here -- both
    // need a real "Sync Gallery" run (which has access to move files
    // between public/ and the private storage directory), same as other
    // editor actions that only take full effect after the next sync.
    return Response.json({ ok: true, private: nowPrivate, requiresSync: true });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Something went wrong", { status: 500 });
  }
}
