// A stateless, signed session cookie for the password-protected remote
// editor -- no session store or database, just an HMAC over the logged-in
// person's name and an expiry timestamp. Built only with Web Crypto/btoa/
// atob so it works unchanged in both the Edge middleware runtime and a
// normal Node API route.
//
// Each person's own password (see editor-users.ts) doubles as their
// session's signing key rather than adding a separate secret env var --
// the whole security model already rests on those passwords, and keying
// the signature by the specific person's own password means changing just
// one person's password invalidates only their sessions, not everyone's.
import { findEditorUser } from "./editor-users";

export const SESSION_COOKIE_NAME = "editor_session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toBase64Url(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function createSessionCookieValue(name: string, password: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_COOKIE_MAX_AGE_SECONDS;
  const encodedName = encodeURIComponent(name);
  const signature = await hmac(password, `editor_session:${encodedName}:${expiry}`);
  // ":" (not ".") as the delimiter -- encodeURIComponent always escapes ":"
  // (to "%3A") but leaves "." untouched, and names are now email addresses,
  // which routinely contain literal periods (e.g. "barthur.ar@gmail.com").
  // A "." delimiter would silently split the name itself into extra pieces.
  return `${encodedName}:${expiry}:${signature}`;
}

// Returns the logged-in person's name if the cookie is valid, null
// otherwise -- callers that only need a yes/no check can just test
// truthiness.
export async function verifySessionCookieValue(value: string | undefined | null): Promise<string | null> {
  if (!value) return null;
  const [encodedName, expiryText, signature] = value.split(":");
  if (!encodedName || !expiryText || !signature) return null;
  const expiry = Number(expiryText);
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return null;

  const user = findEditorUser(decodeURIComponent(encodedName));
  if (!user) return null;

  const expected = await hmac(user.password, `editor_session:${encodedName}:${expiry}`);
  return timingSafeEqual(expected, signature) ? user.name : null;
}

export function readSessionCookieFromRequest(request: Request): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match?.[1];
}

// Convenience for the editor's write routes, which want to know who's
// making a change so commit messages can say so.
export async function getLoggedInEditorName(request: Request): Promise<string | null> {
  return verifySessionCookieValue(readSessionCookieFromRequest(request));
}
