import { normalizePhoneNumber, requestConfirmation } from "../../../../lib/sms-alerts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.phoneNumber === "string" ? body.phoneNumber : "";
  const phoneNumber = normalizePhoneNumber(raw);
  if (!phoneNumber) {
    return Response.json({ error: "Enter a valid 10-digit US phone number." }, { status: 400 });
  }

  const result = await requestConfirmation(phoneNumber);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 429 });
  }

  return Response.json({ ok: true });
}
