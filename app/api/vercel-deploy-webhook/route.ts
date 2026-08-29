import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const FROM_ADDRESS = "noreply@mail.carsonmullerfamily.com";
const OWNER_EMAIL = "clayk1959@gmail.com";
// Same carrier email-to-text gateway trick already used for private-access
// request alerts -- free, no separate SMS service/account needed. Optional:
// text alerts are skipped if unset, matching that same pattern.
const OWNER_SMS_ADDRESS = process.env.OWNER_SMS_ADDRESS || null;

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// A production deploy never goes live broken -- Vercel just keeps serving
// the last good build when a new one fails, so this route (living inside
// that last good build) is always reachable to receive the notification
// for whatever just failed, even though the failure is in a *different,
// newer* deployment than the one currently answering requests.
export async function POST(request: Request) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) return new Response("Not found", { status: 404 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");
  if (!verifySignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { type, payload } = event as {
    type?: string;
    payload?: { deployment?: { url?: string; meta?: Record<string, string> }; project?: { name?: string } };
  };

  // Only these two are worth an email -- acknowledge anything else
  // (deployment.created, deployment.canceled, ...) quietly.
  if (type !== "deployment.error" && type !== "deployment.succeeded") {
    return Response.json({ ok: true, ignored: type });
  }

  const failed = type === "deployment.error";
  const projectName = payload?.project?.name ?? "a project";
  const deployUrl = payload?.deployment?.url ? `https://${payload.deployment.url}` : null;
  const subject = failed ? `FAILED: Deploy failed -- ${projectName}` : `SUCCESS: Deploy succeeded -- ${projectName}`;
  const detail = deployUrl
    ? `<p><a href="${deployUrl}">View the deployment</a> ${failed ? "for build logs" : ""}.</p>`
    : "";

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject,
    html: failed
      ? `<p>A deploy for <strong>${projectName}</strong> just failed. Your live site is unaffected -- Vercel never replaces it with a broken build.</p>${detail}`
      : `<p>A deploy for <strong>${projectName}</strong> just went live.</p>${detail}`,
  });

  // Text alerts stay failure-only -- a routine successful deploy isn't
  // worth interrupting Clay for, only a broken one is.
  if (failed && OWNER_SMS_ADDRESS) {
    const { error: smsError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: OWNER_SMS_ADDRESS,
      subject: "Deploy failed",
      text: `Deploy failed: ${projectName}. Live site is fine (Vercel keeps serving the last good build). Check email for details.`,
    });
    if (smsError) {
      console.error("Deploy-failure text alert failed to send:", smsError.message);
    }
  }

  return Response.json({ ok: true });
}
