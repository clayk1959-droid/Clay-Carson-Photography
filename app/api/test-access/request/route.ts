import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import {
  FROM_ADDRESS,
  OWNER_EMAIL,
  OWNER_SMS_ADDRESS,
  escapeHtml,
  randomToken,
} from "../../../../lib/private-access";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  // Lowercased so two submissions that differ only in casing (e.g. an
  // iPhone auto-capitalizing the first letter on a retry) are recognized as
  // the same person -- this value flows straight into the accounts table's
  // upsert-by-email later, which would otherwise treat them as different
  // people and create a real duplicate account.
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!name || !email) {
    return Response.json({ error: "Name and email are required." }, { status: 400 });
  }

  const token = randomToken();
  const pool = getPool();
  const { rows } = await pool.query(
    `insert into access_requests (name, email, note, action_token) values ($1, $2, $3, $4) returning id`,
    [name, email, note || null, token],
  );
  const id = rows[0].id as number;

  const origin = new URL(request.url).origin;
  const link = (action: "approve" | "deny", sessionType?: "3_months" | "forever") => {
    const url = new URL(`${origin}/api/test-access/decide`);
    url.searchParams.set("id", String(id));
    url.searchParams.set("token", token);
    url.searchParams.set("action", action);
    if (sessionType) url.searchParams.set("session", sessionType);
    return url.toString();
  };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject: `Access request: ${name}`,
    html: `
      <p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) requested access.</p>
      ${note ? `<p>Note: ${escapeHtml(note)}</p>` : ""}
      <p>
        <a href="${link("approve", "3_months")}">Approve — 3 months</a><br>
        <a href="${link("approve", "forever")}">Approve — forever</a><br>
        <a href="${link("deny")}">Deny</a>
      </p>
    `,
  });

  if (OWNER_SMS_ADDRESS) {
    // Best-effort text alert via the carrier's email-to-SMS gateway, so a
    // new request actually gets noticed instead of sitting unread in an
    // inbox with no phone notification. Not guaranteed to arrive -- carrier
    // gateways are known to be inconsistent -- but it's free and doesn't
    // require a separate account. Awaited (not fire-and-forget), since a
    // serverless function's runtime can freeze the instant the response is
    // returned, silently killing an unawaited send before it actually went
    // out. A failure here still doesn't block the request -- the email
    // above is the real notification of record.
    const { error: smsError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: OWNER_SMS_ADDRESS,
      subject: "Access request",
      text: `${name} (${email}) requested access. Check email or the admin page to approve.`,
    });
    if (smsError) {
      console.error("Text alert failed to send:", smsError.message);
    }
  }

  // The request is already saved either way (so it'll still show up on the
  // admin page), but the owner needs to know the notification didn't
  // actually arrive rather than silently never finding out.
  if (error) {
    return Response.json(
      { error: `Request saved, but the owner-notification email failed to send: ${error.message}` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
