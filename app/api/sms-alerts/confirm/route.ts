import { confirmSubscription, normalizePhoneNumber } from "../../../../lib/sms-alerts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.phoneNumber === "string" ? body.phoneNumber : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const phoneNumber = normalizePhoneNumber(raw);

  if (!phoneNumber || !/^\d{6}$/.test(code)) {
    return Response.json({ error: "Enter the 6-digit code from the text message." }, { status: 400 });
  }

  const confirmed = await confirmSubscription(phoneNumber, code);
  if (!confirmed) {
    return Response.json({ error: "That code is incorrect or expired. Request a new one." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
