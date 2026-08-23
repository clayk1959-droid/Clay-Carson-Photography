import { createHash, randomBytes } from "node:crypto";
import { getPool } from "./db";

export const SESSION_COOKIE_NAME = "private_session";
export const OWNER_EMAIL = "clayk1959@gmail.com";
export const FROM_ADDRESS = "noreply@mail.carsonmullerfamily.com";

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
    `select accounts.id as account_id, accounts.email, accounts.name
       from sessions
       join accounts on accounts.id = sessions.account_id
      where sessions.token_hash = $1
        and accounts.revoked_at is null
        and (sessions.expires_at is null or sessions.expires_at > now())`,
    [hash],
  );
  return (rows[0] as { account_id: number; email: string; name: string } | undefined) ?? null;
}
