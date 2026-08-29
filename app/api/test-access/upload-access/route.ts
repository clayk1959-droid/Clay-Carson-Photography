import { cookies } from "next/headers";
import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "../../../../lib/session-cookie";
import { FROM_ADDRESS, escapeHtml } from "../../../../lib/private-access";

export const dynamic = "force-dynamic";

// Grants or revokes photo-submission ability -- deliberately separate from
// gallery_access (see upload_access in db/schema.sql). Invite-only: this is
// the only way an account gets this ability, there's no self-serve request.
export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const cookieStore = await cookies();
  const loggedIn = await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  const accountId = Number(body?.accountId);
  const grant = body?.grant !== false;

  if (!Number.isInteger(accountId)) {
    return Response.json({ error: "Invalid account." }, { status: 400 });
  }

  const pool = getPool();
  if (grant) {
    const { rows } = await pool.query(
      `insert into upload_access (account_id) values ($1)
       on conflict (account_id) do nothing
       returning account_id`,
      [accountId],
    );
    // Only email on a genuinely new grant, not when re-clicking an
    // already-granted account.
    if (rows.length > 0) {
      const { rows: accountRows } = await pool.query(`select name, email from accounts where id = $1`, [
        accountId,
      ]);
      const account = accountRows[0] as { name: string; email: string } | undefined;
      if (account && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: account.email,
          subject: "You can now submit photos — Carson & Muller",
          html: `<p>Hi ${escapeHtml(account.name)},</p><p>Clay has given you the ability to submit photos for a gallery. <a href="https://www.carsonmullerfamily.com/submit-photos">Get started here</a> — if you're not already signed in, that page will ask for your email and send you a fresh login link.</p><p>You can submit up to 30 photos at a time. Clay reviews everything himself and will build the gallery as soon as he can.</p>`,
        });
      }
    }
  } else {
    await pool.query(`delete from upload_access where account_id = $1`, [accountId]);
  }

  return Response.json({ ok: true });
}
