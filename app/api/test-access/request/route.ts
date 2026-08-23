import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import {
  FROM_ADDRESS,
  NTFY_TOPIC,
  OWNER_EMAIL,
  escapeHtml,
  randomToken,
} from "../../../../lib/private-access";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
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

  if (NTFY_TOPIC) {
    // Best-effort push alert via ntfy.sh, so a new request actually gets
    // noticed instead of sitting unread in an inbox with no phone
    // notification. Carrier email-to-SMS gateways turned out to silently
    // drop messages from an unfamiliar sending domain -- this bypasses that
    // by pushing directly, not routing through email at all. Awaited (not
    // fire-and-forget), since a serverless function's runtime can freeze the
    // instant the response is returned, silently killing an unawaited
    // request before it actually went out. A failure here still doesn't
    // block the request -- the email above is the real notification of
    // record.
    try {
      const pushResponse = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        headers: { Title: "Access request", Priority: "urgent", Tags: "lock" },
        body: `${name} (${email}) requested access. Check email or the admin page to approve.`,
      });
      if (!pushResponse.ok) {
        console.error("Push alert failed to send:", pushResponse.status, await pushResponse.text());
      }
    } catch (err) {
      console.error("Push alert failed to send:", err instanceof Error ? err.message : err);
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
