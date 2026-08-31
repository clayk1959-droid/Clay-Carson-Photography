import { Resend } from "resend";
import { getPool } from "../../../../lib/db";
import { FROM_ADDRESS, OWNER_EMAIL, escapeHtml, randomToken } from "../../../../lib/private-access";
import { sendSms } from "../../../../lib/sms";
import collectionOverrides from "../../../../data/collection-overrides.json";

export const dynamic = "force-dynamic";

// This is the real, live version of the request flow already proven out in
// app/api/test-access/request/route.ts -- same mechanics, scoped to one
// specific gallery instead of one global gate. Not behind
// isPrivateAccessEnabled(): that flag was for the experimental test system;
// this only ever does anything for a gallery actually flagged private, which
// is itself the real gate.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  // Lowercased for the same reason as the test system's request route --
  // avoids a duplicate account from a retry that differs only in casing.
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const gallerySlug = typeof body?.gallerySlug === "string" ? body.gallerySlug : "";

  if (!name || !email) {
    return Response.json({ error: "Name and email are required." }, { status: 400 });
  }

  const overrides = collectionOverrides as Record<string, { private?: boolean }>;
  if (!gallerySlug || !overrides[gallerySlug]?.private) {
    return Response.json({ error: "Unknown or non-private gallery." }, { status: 400 });
  }

  const token = randomToken();
  const pool = getPool();
  const { rows } = await pool.query(
    `insert into access_requests (name, email, gallery_slug, action_token) values ($1, $2, $3, $4) returning id`,
    [name, email, gallerySlug, token],
  );
  const id = rows[0].id as number;

  const origin = new URL(request.url).origin;
  const link = (action: "approve" | "deny", sessionType?: "3_months" | "forever") => {
    const url = new URL(`${origin}/api/gallery-access/decide`);
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
    subject: `Access request: ${name} — ${gallerySlug}`,
    html: `
      <p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) requested access to
      <strong>${escapeHtml(gallerySlug)}</strong>.</p>
      <p>
        <a href="${link("approve", "3_months")}">Approve — 3 months</a><br>
        <a href="${link("approve", "forever")}">Approve — forever</a><br>
        <a href="${link("deny")}">Deny</a>
      </p>
    `,
  });

  await sendSms(`Access request: ${name} (${email}) requested access to ${gallerySlug}. Check email to approve.`);

  if (error) {
    return Response.json(
      { error: `Request saved, but the owner-notification email failed to send: ${error.message}` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
