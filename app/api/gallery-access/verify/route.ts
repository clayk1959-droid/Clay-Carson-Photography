import { getPool } from "../../../../lib/db";
import { SESSION_COOKIE_NAME, hashToken, randomToken, sessionExpiry, type SessionType } from "../../../../lib/private-access";

export const dynamic = "force-dynamic";

// Same magic-link redemption as the test system's verify route -- one
// difference: redirects straight to the gallery the person requested
// instead of a generic landing page, since that's the whole point here.
// gallery is optional -- a link minted for upload-only access (no specific
// gallery to go to) omits it and lands on /submit-photos instead.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const gallerySlug = url.searchParams.get("gallery") ?? "";
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

  // Same reasoning as the test system: DB expires_at stays NULL for
  // "forever", but the cookie needs a concrete date or the browser treats
  // it as session-only and drops it on close.
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
      Location: gallerySlug ? `${url.origin}/collections/${encodeURIComponent(gallerySlug)}` : `${url.origin}/submit-photos`,
      "Set-Cookie": cookieParts.join("; "),
    },
  });
}
