import { cookies } from "next/headers";
import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "../../../../lib/session-cookie";
import { FROM_ADDRESS, escapeHtml } from "../../../../lib/private-access";

export const dynamic = "force-dynamic";

// Manual trigger only -- Clay decides when a submitted-photo gallery is
// actually ready, this never fires automatically.
export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const cookieStore = await cookies();
  const loggedIn = await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!loggedIn) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  const accountId = Number(body?.accountId);
  if (!Number.isInteger(accountId)) {
    return Response.json({ error: "Invalid account." }, { status: 400 });
  }

  const pool = getPool();
  const { rows } = await pool.query(`select name, email from accounts where id = $1`, [accountId]);
  const account = rows[0] as { name: string; email: string } | undefined;
  if (!account) return Response.json({ error: "Account not found." }, { status: 404 });

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: account.email,
      subject: "Your gallery is live — Carson & Muller",
      html: `<p>Hi ${escapeHtml(account.name)},</p><p>The photos you submitted have been reviewed and built into a gallery. Take a look at the <a href="https://www.carsonmullerfamily.com/collections">Galleries page</a> to see it.</p><p>Thanks for sharing them!</p>`,
    });
  }

  return Response.json({ ok: true });
}
