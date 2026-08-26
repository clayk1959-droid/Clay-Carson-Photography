import { cookies } from "next/headers";
import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "../../../../lib/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const cookieStore = await cookies();
  // next/headers' cookies() decodes the value back down to the app's own
  // "name:expiry:signature" format -- reading request.headers.get("cookie")
  // directly instead left it percent-encoded (Next encodes cookie values on
  // the way out) and verifySessionCookieValue's colon-split silently failed
  // on that, so Revoke always 401'd regardless of login state.
  const loggedIn = await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const revoke = body?.revoke !== false; // default true; pass revoke:false to restore

  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid account id." }, { status: 400 });
  }

  const pool = getPool();
  await pool.query(`update accounts set revoked_at = $1 where id = $2`, [revoke ? new Date() : null, id]);

  return Response.json({ ok: true });
}
