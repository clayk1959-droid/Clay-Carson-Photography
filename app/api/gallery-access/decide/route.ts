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

export const dynamic = "force-dynamic";

function htmlResponse(message: string, status: number) {
  // Same reasoning as the test system's decide route: a hand-built
  // Response skips the viewport meta tag Next.js pages get automatically,
  // which made this unreadable on a phone until added explicitly.
  return new Response(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>` +
      `<body style="font-family: sans-serif; font-size: 19px; line-height: 1.5; padding: 40px 24px; max-width: 480px;"><p>${message}</p></body></html>`,
    { status, headers: { "content-type": "text/html" } },
  );
}

export async function GET(request: Request) {
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
    `select id, name, email, gallery_slug, status from access_requests where id = $1 and action_token = $2`,
    [id, token],
  );
  const reqRow = rows[0] as
    | { id: number; name: string; email: string; gallery_slug: string | null; status: string }
    | undefined;
  if (!reqRow) return htmlResponse("Invalid or unknown request.", 404);
  if (!reqRow.gallery_slug) return htmlResponse("This request has no gallery attached.", 400);
  if (reqRow.status !== "pending") {
    return htmlResponse(`This request was already <strong>${reqRow.status}</strong>.`, 200);
  }

  if (action === "deny") {
    await pool.query(`update access_requests set status = 'denied', decided_at = now() where id = $1`, [id]);
    return htmlResponse(`Denied access to ${escapeHtml(reqRow.gallery_slug)} for ${escapeHtml(reqRow.name)}.`, 200);
  }

  const sessionType: SessionType = sessionParam === "forever" ? "forever" : "3_months";
  await pool.query(`update access_requests set status = 'approved', decided_at = now() where id = $1`, [id]);

  const magicToken = randomToken();
  const magicHash = hashToken(magicToken);
  const expires = magicLinkExpiry();

  const { rows: accountRows } = await pool.query(
    `insert into accounts (email, name, session_type, magic_token_hash, magic_token_expires_at)
     values ($1, $2, $3, $4, $5)
     on conflict (email) do update set
       name = excluded.name,
       session_type = excluded.session_type,
       revoked_at = null,
       magic_token_hash = excluded.magic_token_hash,
       magic_token_expires_at = excluded.magic_token_expires_at
     returning id`,
    [reqRow.email, reqRow.name, sessionType, magicHash, expires.toISOString()],
  );
  const accountId = accountRows[0].id as number;

  // The actual grant -- idempotent, since approving the same person for a
  // gallery they already have access to (e.g. a second request) shouldn't
  // error.
  await pool.query(
    `insert into gallery_access (account_id, gallery_slug) values ($1, $2)
     on conflict (account_id, gallery_slug) do nothing`,
    [accountId, reqRow.gallery_slug],
  );

  const loginLink =
    `${url.origin}/api/gallery-access/verify?email=${encodeURIComponent(reqRow.email)}` +
    `&token=${magicToken}&gallery=${encodeURIComponent(reqRow.gallery_slug)}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: reqRow.email,
    subject: "You're in — Carson & Muller",
    html: `<p>Hi ${escapeHtml(reqRow.name)},</p><p>You've been approved for "${escapeHtml(reqRow.gallery_slug)}". <a href="${loginLink}">Click here to view it</a>.</p><p>This link works once and expires in an hour.</p>`,
  });

  if (error) {
    // Same silent-failure trap as the test system's decide route -- Resend
    // returns an error object rather than throwing, so this must be checked
    // explicitly or a failed send looks identical to a real one.
    return htmlResponse(
      `Approved ${escapeHtml(reqRow.name)} for ${escapeHtml(reqRow.gallery_slug)}, but the login-link email failed ` +
        `to send: <strong>${escapeHtml(error.message)}</strong>. The account and grant were still created, so a ` +
        `fresh login link can be sent once that's fixed.`,
      200,
    );
  }

  return htmlResponse(
    `Approved ${escapeHtml(reqRow.name)} for ${escapeHtml(reqRow.gallery_slug)} ` +
      `(${sessionType === "forever" ? "forever" : "3 months"}) and sent them a login link.`,
    200,
  );
}
