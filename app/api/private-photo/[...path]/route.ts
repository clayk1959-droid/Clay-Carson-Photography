import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { isEditorEnabled } from "../../../../lib/editor-mode";
import { getAccountForSession, hasGalleryAccess, SESSION_COOKIE_NAME } from "../../../../lib/private-access";

export const dynamic = "force-dynamic";

// This route is the actual privacy boundary for a private gallery's photos
// -- not the page. Every photo in a private collection is served through
// here instead of a static public/ file, and every single request re-checks
// the session, exactly like the page itself does. Deliberately mirrors the
// public URL shape (galleries/{slug}/{file}, gallery-thumbnails/{slug}/{file})
// so the same src.replace("/galleries/", "/gallery-thumbnails/") calls used
// everywhere else for public photos keep working unchanged -- only the
// /api/private-photo/ prefix differs.
const STORAGE_ROOT = path.join(process.cwd(), "private-galleries");

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  // Expect exactly [type, slug, filename].
  if (segments.length !== 3) return new Response("Not found", { status: 404 });
  const [type, slug, filename] = segments;

  if (type !== "galleries" && type !== "gallery-thumbnails") {
    return new Response("Not found", { status: 404 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) return new Response("Not found", { status: 404 });
  // No path separators or traversal -- filename must be a plain, single
  // path segment (Next.js already prevents "../" surviving into a
  // [...path] segment, but this is the actual security boundary, worth
  // being explicit rather than trusting that alone).
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  // The editor (local dev, or the password-gated remote-editor deployment)
  // always sees every gallery, private or not, for editing -- the family
  // access grant is a visitor concept, not something that should also gate
  // the person managing privacy in the first place.
  if (!isEditorEnabled()) {
    const cookieStore = await cookies();
    const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    // Same response for "not logged in" and "logged in but not granted this
    // gallery" -- doesn't confirm or deny anything about whether the file
    // exists or who has access to it.
    if (!account || !(await hasGalleryAccess(account.account_id, slug))) {
      return new Response("Not found", { status: 404 });
    }
  }

  const filePath = path.join(STORAGE_ROOT, type, slug, filename);
  // Belt-and-suspenders against the traversal check above: the resolved
  // path must still land inside STORAGE_ROOT.
  if (!filePath.startsWith(STORAGE_ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/jpeg",
      // Must never be cacheable at a shared/edge layer -- this response is
      // specific to the logged-in visitor who just passed the check above.
      "Cache-Control": "private, no-store",
    },
  });
}
