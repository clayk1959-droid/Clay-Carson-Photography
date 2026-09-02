import { createHash, randomInt } from "node:crypto";
import { getPool } from "./db";
import { sendSmsTo } from "./sms";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
// A code text costs real money and this page is unauthenticated by design
// (carriers need to be able to reach it) -- these two limits are the whole
// abuse defense: no more than one send per number per minute, and no more
// than a handful of sends site-wide per hour. Generous for the one real
// person who'll ever use this, tight enough that a bot hammering the
// endpoint can't run up a bill.
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 10;

// US-only, matching the Twilio number's own country -- strips formatting
// and accepts either a bare 10-digit number or one with a leading 1.
export function normalizePhoneNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export type RequestResult = { ok: true } | { ok: false; error: string };

export async function requestConfirmation(phoneNumber: string): Promise<RequestResult> {
  const pool = getPool();

  const { rows: recent } = await pool.query<{ requested_at: string }>(
    "select requested_at from sms_subscribers where phone_number = $1",
    [phoneNumber],
  );
  if (recent[0] && Date.now() - new Date(recent[0].requested_at).getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false, error: "A code was just sent to that number — wait a minute before requesting another." };
  }

  const { rows: countRows } = await pool.query<{ count: string }>(
    "select count(*)::text as count from sms_subscribers where requested_at > now() - interval '1 hour'",
  );
  if (Number(countRows[0]?.count ?? 0) >= MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "Too many requests right now — try again later." };
  }

  const code = generateCode();
  await pool.query(
    `insert into sms_subscribers (phone_number, confirm_code_hash, confirm_code_expires_at, requested_at)
     values ($1, $2, $3, now())
     on conflict (phone_number) do update set
       confirm_code_hash = excluded.confirm_code_hash,
       confirm_code_expires_at = excluded.confirm_code_expires_at,
       requested_at = now()`,
    [phoneNumber, hashCode(code), new Date(Date.now() + CODE_TTL_MS)],
  );

  await sendSmsTo(
    phoneNumber,
    `Your Carson & Muller Family site alerts confirmation code is ${code}. It expires in 10 minutes. Reply STOP to unsubscribe.`,
  );

  return { ok: true };
}

export async function confirmSubscription(phoneNumber: string, code: string): Promise<boolean> {
  const pool = getPool();
  const { rows } = await pool.query<{ confirm_code_hash: string | null; confirm_code_expires_at: string | null }>(
    "select confirm_code_hash, confirm_code_expires_at from sms_subscribers where phone_number = $1",
    [phoneNumber],
  );
  const row = rows[0];
  if (!row?.confirm_code_hash || !row.confirm_code_expires_at) return false;
  if (new Date(row.confirm_code_expires_at) < new Date()) return false;
  if (row.confirm_code_hash !== hashCode(code)) return false;

  await pool.query(
    `update sms_subscribers
     set confirmed_at = now(), confirm_code_hash = null, confirm_code_expires_at = null
     where phone_number = $1`,
    [phoneNumber],
  );
  return true;
}
