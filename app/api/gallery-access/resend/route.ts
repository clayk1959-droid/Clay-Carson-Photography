import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import { FROM_ADDRESS, escapeHtml, hashToken, magicLinkExpiry, randomToken } from "../../../../lib/private-access";
import collectionOverrides from "../../../../data/collection-overrides.json";

export const dynamic = "force-dynamic";

// Lets someone who already has an account (gallery access, upload access,
// or both) get a fresh login link on a new device or browser, without
// needing the owner to approve anything again. gallerySlug is optional --
// omitted, this just checks the account exists and is active (used from
// /submit-photos, which has no single gallery to scope to); given, it also
// requires that specific gallery_access grant (used from a private
// gallery's own gate page), same as before.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const gallerySlug = typeof body?.gallerySlug === "string" ? body.gallerySlug : "";

  if (!email) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const overrides = collectionOverrides as Record<string, { private?: boolean }>;
  if (gallerySlug && !overrides[gallerySlug]?.private) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Same response regardless of whether the email/grant actually exists --
  // this endpoint must never reveal who has access to what.
  const genericResponse = Response.json({ ok: true });

  const pool = getPool();
  const { rows } = gallerySlug
    ? await pool.query(
        `select accounts.id, accounts.name from accounts
           join gallery_access on gallery_access.account_id = accounts.id
          where accounts.email = $1
            and gallery_access.gallery_slug = $2
            and accounts.revoked_at is null`,
        [email, gallerySlug],
      )
    : await pool.query(`select id, name from accounts where email = $1 and revoked_at is null`, [email]);
  const account = rows[0] as { id: number; name: string } | undefined;
  if (!account) return genericResponse;

  const magicToken = randomToken();
  const magicHash = hashToken(magicToken);
  const expires = magicLinkExpiry();
  await pool.query(`update accounts set magic_token_hash = $1, magic_token_expires_at = $2 where id = $3`, [
    magicHash,
    expires.toISOString(),
    account.id,
  ]);

  const origin = new URL(request.url).origin;
  const loginLink =
    `${origin}/api/gallery-access/verify?email=${encodeURIComponent(email)}&token=${magicToken}` +
    (gallerySlug ? `&gallery=${encodeURIComponent(gallerySlug)}` : "");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Your login link — Carson & Muller",
    html: gallerySlug
      ? `<p>Hi ${escapeHtml(account.name)},</p><p><a href="${loginLink}">Click here to log back in</a> to "${escapeHtml(gallerySlug)}".</p><p>This link works once and expires in an hour.</p>`
      : `<p>Hi ${escapeHtml(account.name)},</p><p><a href="${loginLink}">Click here to log back in</a>.</p><p>This link works once and expires in an hour.</p>`,
  });
  if (error) {
    // Logged server-side only -- the response to the caller stays generic
    // either way, same reasoning as the account lookup above.
    console.error("Resend login-link email failed:", error.message);
  }

  return genericResponse;
}
