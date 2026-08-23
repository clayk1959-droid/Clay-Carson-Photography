import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import {
  FROM_ADDRESS,
  escapeHtml,
  hashToken,
  magicLinkExpiry,
  randomToken,
  type SessionType,
} from "../../../../lib/private-access";
import { isPrivateAccessEnabled } from "../../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

function htmlResponse(message: string, status: number) {
  return new Response(
    `<!doctype html><body style="font-family: sans-serif; padding: 40px; max-width: 480px;"><p>${message}</p></body>`,
    { status, headers: { "content-type": "text/html" } },
  );
}

export async function GET(request: Request) {
  if (!isPrivateAccessEnabled()) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  const token = url.searchParams.get("token") ?? "";
  const action = url.searchParams.get("action");
  const sessionParam = url.searchParams.get("session");

  if (!Number.isInteger(id) || !token || (action !== "approve" && action !== "deny")) {
    return htmlResponse("Invalid link.", 400);
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `select id, name, email, status from access_requests where id = $1 and action_token = $2`,
    [id, token],
  );
  const reqRow = rows[0] as { id: number; name: string; email: string; status: string } | undefined;
  if (!reqRow) return htmlResponse("Invalid or unknown request.", 404);
  if (reqRow.status !== "pending") {
    return htmlResponse(`This request was already <strong>${reqRow.status}</strong>.`, 200);
  }

  if (action === "deny") {
    await pool.query(`update access_requests set status = 'denied', decided_at = now() where id = $1`, [id]);
    return htmlResponse(`Denied access for ${escapeHtml(reqRow.name)}.`, 200);
  }

  const sessionType: SessionType = sessionParam === "forever" ? "forever" : "3_months";
  await pool.query(`update access_requests set status = 'approved', decided_at = now() where id = $1`, [id]);

  const magicToken = randomToken();
  const magicHash = hashToken(magicToken);
  const expires = magicLinkExpiry();

  await pool.query(
    `insert into accounts (email, name, session_type, magic_token_hash, magic_token_expires_at)
     values ($1, $2, $3, $4, $5)
     on conflict (email) do update set
       name = excluded.name,
       session_type = excluded.session_type,
       revoked_at = null,
       magic_token_hash = excluded.magic_token_hash,
       magic_token_expires_at = excluded.magic_token_expires_at`,
    [reqRow.email, reqRow.name, sessionType, magicHash, expires.toISOString()],
  );

  const loginLink = `${url.origin}/api/test-access/verify?email=${encodeURIComponent(reqRow.email)}&token=${magicToken}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: reqRow.email,
    subject: "You're in — Carson & Muller private access",
    html: `<p>Hi ${escapeHtml(reqRow.name)},</p><p>You've been approved. <a href="${loginLink}">Click here to log in</a>.</p><p>This link works once and expires in an hour.</p>`,
  });

  if (error) {
    // Resend's SDK returns an error object here rather than throwing --
    // without this check, a failed send (e.g. sandbox mode only allowing
    // the account owner as a recipient) looked identical to a real one.
    return htmlResponse(
      `Approved ${escapeHtml(reqRow.name)}, but the login-link email failed to send: <strong>${escapeHtml(error.message)}</strong>. ` +
        `This usually means the sending domain (<code>${escapeHtml(FROM_ADDRESS)}</code>) isn't verified with Resend yet, ` +
        `so it can only email the account owner, not other people. The account itself was created, so a fresh login link can ` +
        `still be sent once that's fixed.`,
      200,
    );
  }

  return htmlResponse(
    `Approved ${escapeHtml(reqRow.name)} (${sessionType === "forever" ? "forever" : "3 months"}) and sent them a login link.`,
    200,
  );
}
