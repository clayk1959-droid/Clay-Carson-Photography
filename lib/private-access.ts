import { createHash, randomBytes } from "node:crypto";
import { getPool } from "./db";

export const SESSION_COOKIE_NAME = "private_session";
export const OWNER_EMAIL = "clayk1959@gmail.com";
export const FROM_ADDRESS = "onboarding@resend.dev";

const MAGIC_LINK_TTL_MS = 60 * 60 * 1000; // 1 hour, single use
const THREE_MONTHS_MS = 1000 * 60 * 60 * 24 * 90;

export type SessionType = "3_months" | "forever";

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

// Only the hash is ever stored -- the raw token lives solely in the
// email link and the browser's cookie.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(type: SessionType): Date | null {
  return type === "forever" ? null : new Date(Date.now() + THREE_MONTHS_MS);
}

export function magicLinkExpiry(): Date {
  return new Date(Date.now() + MAGIC_LINK_TTL_MS);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function getAccountForSession(rawToken: string | undefined | null) {
  if (!rawToken) return null;
  const pool = getPool();
  const hash = hashToken(rawToken);
  const { rows } = await pool.query(
    `select accounts.id as account_id, accounts.email, accounts.name,
            sessions.id as session_id, sessions.notified_at
       from sessions
       join accounts on accounts.id = sessions.account_id
      where sessions.token_hash = $1
        and accounts.revoked_at is null
        and (sessions.expires_at is null or sessions.expires_at > now())`,
    [hash],
  );
  return (
    (rows[0] as
      | { account_id: number; email: string; name: string; session_id: number; notified_at: string | null }
      | undefined) ?? null
  );
}

// Sends the owner an email the first time a given session successfully
// reaches the protected test page -- guarded by notified_at so refreshing
// the success page doesn't re-notify every time.
export async function notifyOwnerOnce(sessionId: number, notifiedAt: string | null, name: string, email: string) {
  if (notifiedAt) return;
  const pool = getPool();
  const { rowCount } = await pool.query(
    `update sessions set notified_at = now() where id = $1 and notified_at is null`,
    [sessionId],
  );
  if (rowCount === 0) return; // another request already claimed the notification

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: OWNER_EMAIL,
    subject: `${name} got in!`,
    text: `${name} (${email}) just successfully reached the protected test page.`,
  });
}
