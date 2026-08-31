import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { sendSms } from "../../../lib/sms";

export const dynamic = "force-dynamic";

const FROM_ADDRESS = "noreply@mail.carsonmullerfamily.com";
const OWNER_EMAIL = "clayk1959@gmail.com";

// Friendly names for the three Vercel projects this repo deploys, so the
// alert says "Open"/"Editable"/"Private" instead of the raw project slug.
const PROJECT_LABELS: Record<string, string> = {
  "clay-carson-photography": "Open",
  "clay-carson-photography-editor": "Editable",
  "clay-carson-photography-private": "Private",
};

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
    payload?: { deployment?: { url?: string; name?: string; meta?: Record<string, string> } };
  };

  // Only these two are worth an email -- acknowledge anything else
  // (deployment.created, deployment.canceled, ...) quietly.
  if (type !== "deployment.error" && type !== "deployment.succeeded") {
    return Response.json({ ok: true, ignored: type });
  }

  const failed = type === "deployment.error";
  // Confirmed from a real logged payload -- payload.project only has an id,
  // the project's slug lives at payload.deployment.name instead.
  const projectName = payload?.deployment?.name ?? "a project";
  const projectLabel = PROJECT_LABELS[projectName] ?? projectName;
  const deployUrl = payload?.deployment?.url ? `https://${payload.deployment.url}` : null;
  const subject = failed ? `FAILED: Deploy failed -- ${projectLabel}` : `SUCCESS: Deploy succeeded -- ${projectLabel}`;
  const detail = deployUrl
    ? `<p><a href="${deployUrl}">View the deployment</a> ${failed ? "for build logs" : ""}.</p>`
    : "";

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject,
    html: failed
      ? `<p>A deploy for <strong>${projectLabel}</strong> just failed. Your live site is unaffected -- Vercel never replaces it with a broken build.</p>${detail}`
      : `<p>A deploy for <strong>${projectLabel}</strong> just went live.</p>${detail}`,
  });

  // Text alerts stay failure-only -- a routine successful deploy isn't
  // worth interrupting Clay for, only a broken one is.
  if (failed) {
    await sendSms(
      `Deploy failed: ${projectLabel}. Live site is fine (Vercel keeps serving the last good build). Check email for details.`,
    );
  }

  return Response.json({ ok: true });
}
