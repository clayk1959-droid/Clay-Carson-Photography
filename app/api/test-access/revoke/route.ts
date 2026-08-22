import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "../../../../lib/session-cookie";

export const dynamic = "force-dynamic";

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1];
}

export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const loggedIn = await isValidSessionCookieValue(readCookie(request, SESSION_COOKIE_NAME));
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
