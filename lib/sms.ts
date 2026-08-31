// Real SMS via Twilio, replacing the old carrier email-to-text gateway trick
// (OWNER_SMS_ADDRESS) after AT&T discontinued theirs entirely. Optional --
// silently skipped if any of the four env vars below aren't set, same as
// the gateway address was, so email alerts keep working on their own in
// local dev where these usually aren't configured.
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || null;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || null;
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || null;
const OWNER_PHONE_NUMBER = process.env.OWNER_PHONE_NUMBER || null;

// Best-effort, like the gateway-email sends it replaces -- awaited so a
// serverless function freeze can't silently kill it, but a failure here
// never blocks the caller's real work (saving the request, sending the
// email, etc.).
export async function sendSms(body: string): Promise<void> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER || !OWNER_PHONE_NUMBER) return;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: FROM_NUMBER, To: OWNER_PHONE_NUMBER, Body: body }),
      },
    );
    if (!response.ok) {
      console.error("Text alert failed to send:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Text alert failed to send:", error);
  }
}
