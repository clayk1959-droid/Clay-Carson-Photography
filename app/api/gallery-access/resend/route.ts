import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import { FROM_ADDRESS, escapeHtml, hashToken, magicLinkExpiry, randomToken } from "../../../../lib/private-access";
import collectionOverrides from "../../../../data/collection-overrides.json";

export const dynamic = "force-dynamic";

// Lets someone who's already been granted access to a private gallery get a
// fresh login link on a new device or browser, without needing the owner to
// approve anything again -- approval already happened once; this just
// re-issues the "you're logged in" session, the same way the original
// magic-link email did.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const gallerySlug = typeof body?.gallerySlug === "string" ? body.gallerySlug : "";

  const overrides = collectionOverrides as Record<string, { private?: boolean }>;
  if (!email || !gallerySlug || !overrides[gallerySlug]?.private) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Same response regardless of whether the email/grant actually exists --
  // this endpoint must never reveal who has access to what.
  const genericResponse = Response.json({ ok: true });

  const pool = getPool();
  const { rows } = await pool.query(
    `select accounts.id, accounts.name from accounts
       join gallery_access on gallery_access.account_id = accounts.id
      where accounts.email = $1
        and gallery_access.gallery_slug = $2
        and accounts.revoked_at is null`,
    [email, gallerySlug],
  );
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
    `${origin}/api/gallery-access/verify?email=${encodeURIComponent(email)}` +
    `&token=${magicToken}&gallery=${encodeURIComponent(gallerySlug)}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Your login link — Carson & Muller",
    html: `<p>Hi ${escapeHtml(account.name)},</p><p><a href="${loginLink}">Click here to log back in</a> to "${escapeHtml(gallerySlug)}".</p><p>This link works once and expires in an hour.</p>`,
  });
  if (error) {
    // Logged server-side only -- the response to the caller stays generic
    // either way, same reasoning as the account lookup above.
    console.error("Resend login-link email failed:", error.message);
  }

  return genericResponse;
}
