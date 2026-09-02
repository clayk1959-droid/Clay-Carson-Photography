import { getPool } from "./db";

// Real SMS via Twilio, replacing the old carrier email-to-text gateway trick
// (OWNER_SMS_ADDRESS) after AT&T discontinued theirs entirely. Optional --
// silently skipped if these env vars aren't set, so email alerts keep
// working on their own in local dev where they usually aren't configured.
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || null;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || null;
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || null;

// Best-effort, like the gateway-email sends it replaces -- awaited so a
// serverless function freeze can't silently kill it, but a failure here
// never blocks the caller's real work (saving the request, sending the
// email, etc.).
export async function sendSmsTo(to: string, body: string): Promise<void> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) return;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: FROM_NUMBER, To: to, Body: body }),
      },
    );
    if (!response.ok) {
      console.error("Text alert failed to send:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Text alert failed to send:", error);
  }
}

// Sends to every phone number that's completed the real opt-in flow at
// /sms-alerts (see lib/sms-alerts.ts) -- required so there's an actual,
// carrier-verifiable consent mechanism behind these alerts, not just a
// number Clay typed into an env var. In practice this is just Clay's own
// number, since nobody else has a reason to opt into his site's admin
// alerts, but the mechanism has to be real for A2P review to pass.
export async function sendSms(body: string): Promise<void> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) return;

  let phoneNumbers: string[];
  try {
    const { rows } = await getPool().query<{ phone_number: string }>(
      "select phone_number from sms_subscribers where confirmed_at is not null",
    );
    phoneNumbers = rows.map((row) => row.phone_number);
  } catch (error) {
    console.error("Text alert failed to send (couldn't read subscribers):", error);
    return;
  }

  await Promise.all(phoneNumbers.map((phoneNumber) => sendSmsTo(phoneNumber, body)));
}
