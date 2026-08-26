import { cookies } from "next/headers";
import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "../../../../lib/session-cookie";

export const dynamic = "force-dynamic";

// Backs the admin accounts × private-galleries checkbox grid -- one row per
// account, one column per collection currently flagged private. Same
// gallery_access table the real request/approve flow on the main site
// grants into; this just lets Clay toggle it directly.
export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const cookieStore = await cookies();
  // next/headers' cookies() decodes the value back down to the app's own
  // "name:expiry:signature" format -- reading request.headers.get("cookie")
  // directly instead leaves it percent-encoded (Next encodes cookie values
  // on the way out) and verifySessionCookieValue's colon-split silently
  // fails on that, always returning "Unauthorized".
  const loggedIn = await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  const accountId = Number(body?.accountId);
  const gallerySlug = typeof body?.gallerySlug === "string" ? body.gallerySlug : "";
  const grant = body?.grant !== false;

  if (!Number.isInteger(accountId) || !gallerySlug) {
    return Response.json({ error: "Invalid account or gallery." }, { status: 400 });
  }

  const pool = getPool();
  if (grant) {
    await pool.query(
      `insert into gallery_access (account_id, gallery_slug) values ($1, $2)
       on conflict (account_id, gallery_slug) do nothing`,
      [accountId, gallerySlug],
    );
  } else {
    await pool.query(`delete from gallery_access where account_id = $1 and gallery_slug = $2`, [
      accountId,
      gallerySlug,
    ]);
  }

  return Response.json({ ok: true });
}
