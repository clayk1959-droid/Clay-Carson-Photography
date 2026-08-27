import { readFile } from "node:fs/promises";
import path from "node:path";
import indexData from "../../../../data/photo-data/_index.json";

export const dynamic = "force-dynamic";

// Deliberately the one photo from a private gallery shown to every
// visitor, logged in or not -- Clay wants a private gallery's card to
// look like any other on the Galleries page, not blank. Not gated by
// session (a blank card would be an implicit "this one's special"
// indicator, which the design explicitly avoids), but not reachable by
// guessing either: the token has nothing to do with the collection's slug
// or filenames, so nobody can find it without already having the
// rendered page in front of them. See scripts/sync-gallery.mjs for where
// the token is generated and frozen.
const STORAGE_ROOT = path.join(process.cwd(), "private-galleries");

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card = (indexData.cards as Array<{ slug: string; private: boolean; coverToken: string | null; coverBasename: string }>).find(
    (entry) => entry.private && entry.coverToken === token,
  );
  if (!card) return new Response("Not found", { status: 404 });

  const filePath = path.join(STORAGE_ROOT, "gallery-thumbnails", card.slug, card.coverBasename);
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
      // Fine to cache -- unlike the session-gated private-photo route,
      // this response is identical for every visitor by design. Kept
      // short rather than far-future/immutable: the token is stable, but
      // the cover photo it points at can change (a new cover pick), and a
      // long-cached response would keep serving the old one.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
