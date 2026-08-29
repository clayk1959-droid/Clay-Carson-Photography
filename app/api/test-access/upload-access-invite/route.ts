import { cookies } from "next/headers";
import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "../../../../lib/session-cookie";
import { FROM_ADDRESS, escapeHtml, hashToken, magicLinkExpiry, randomToken } from "../../../../lib/private-access";

export const dynamic = "force-dynamic";

// Creates a brand-new account for someone who has never requested (or been
// granted) anything before, purely for upload access -- the gap the plain
// "Can submit photos" toggle can't cover, since that only works on an
// account that already exists. Sends a real, clickable login link, not a
// vague "next time you're signed in."
export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const cookieStore = await cookies();
  const loggedIn = await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name || !email) {
    return Response.json({ error: "Name and email are both required." }, { status: 400 });
  }

  const magicToken = randomToken();
  const magicHash = hashToken(magicToken);
  const expires = magicLinkExpiry();

  const pool = getPool();
  const { rows } = await pool.query(
    `insert into accounts (email, name, session_type, magic_token_hash, magic_token_expires_at)
     values ($1, $2, '3_months', $3, $4)
     on conflict (email) do update set
       name = excluded.name,
       revoked_at = null,
       magic_token_hash = excluded.magic_token_hash,
       magic_token_expires_at = excluded.magic_token_expires_at
     returning id`,
    [email, name, magicHash, expires.toISOString()],
  );
  const accountId = rows[0].id as number;

  await pool.query(
    `insert into upload_access (account_id) values ($1) on conflict (account_id) do nothing`,
    [accountId],
  );

  // Hardcoded to the main site's own domain, not this route's own origin --
  // this admin route runs on the private-access project, but the login
  // link has to point at the main site, where /submit-photos actually lives.
  if (process.env.RESEND_API_KEY) {
    const loginLink = `https://www.carsonmullerfamily.com/api/gallery-access/verify?email=${encodeURIComponent(email)}&token=${magicToken}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "You can now submit photos — Carson & Muller",
      html: `<p>Hi ${escapeHtml(name)},</p><p>Clay has given you the ability to submit photos for a gallery. <a href="${loginLink}">Click here to get started</a> — this link works once and expires in an hour.</p><p>You can submit up to 30 photos at a time. Clay reviews everything himself and will build the gallery as soon as he can.</p>`,
    });
  }

  return Response.json({ ok: true });
}
