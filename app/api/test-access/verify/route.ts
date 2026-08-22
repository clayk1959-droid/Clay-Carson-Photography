import { getPool } from "../../../../lib/db";
import { SESSION_COOKIE_NAME, hashToken, randomToken, sessionExpiry, type SessionType } from "../../../../lib/private-access";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!email || !token) {
    return new Response("Invalid link.", { status: 400 });
  }

  const pool = getPool();
  const hash = hashToken(token);
  const { rows } = await pool.query(
    `select id, session_type from accounts
      where email = $1
        and magic_token_hash = $2
        and magic_token_expires_at > now()
        and revoked_at is null`,
    [email, hash],
  );
  const account = rows[0] as { id: number; session_type: SessionType } | undefined;
  if (!account) {
    return new Response("This login link is invalid or has expired.", { status: 400 });
  }

  // Single-use: clear the magic token now that it's been redeemed.
  await pool.query(
    `update accounts set magic_token_hash = null, magic_token_expires_at = null where id = $1`,
    [account.id],
  );

  const sessionToken = randomToken();
  const sessionHash = hashToken(sessionToken);
  const expires = sessionExpiry(account.session_type);

  await pool.query(`insert into sessions (account_id, token_hash, expires_at) values ($1, $2, $3)`, [
    account.id,
    sessionHash,
    expires ? expires.toISOString() : null,
  ]);
  await pool.query(`insert into login_log (account_id) values ($1)`, [account.id]);

  // The DB's expires_at stays NULL for "forever" (that's what the login
  // check compares against), but the cookie itself still needs a concrete
  // date or the browser treats it as session-only and drops it on close --
  // that would make "forever" behave like "until you close your browser".
  const tenYearsOut = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10);
  const cookieExpires = expires ?? tenYearsOut;

  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${sessionToken}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${cookieExpires.toUTCString()}`,
  ];
  if (process.env.NODE_ENV === "production") cookieParts.push("Secure");

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/test-access?loggedin=1`,
      "Set-Cookie": cookieParts.join("; "),
    },
  });
}
