// A stateless, signed session cookie for the password-protected remote
// editor -- no session store or database, just an HMAC over an expiry
// timestamp. Built only with Web Crypto/btoa/atob so it works unchanged in
// both the Edge middleware runtime and a normal Node API route.
//
// Reuses EDITOR_PASSWORD itself as the signing key rather than adding a
// second secret env var -- the whole security model already rests on that
// one password, so a separate signing secret wouldn't meaningfully change
// the threat model for a private family site, just add one more value to
// keep track of.

export const SESSION_COOKIE_NAME = "editor_session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecret(): string {
  const value = process.env.EDITOR_PASSWORD;
  if (!value) throw new Error("Missing required environment variable: EDITOR_PASSWORD");
  return value;
}

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

export async function createSessionCookieValue(): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_COOKIE_MAX_AGE_SECONDS;
  const signature = await hmac(getSecret(), `editor_session:${expiry}`);
  return `${expiry}.${signature}`;
}

export async function isValidSessionCookieValue(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const [expiryText, signature] = value.split(".");
  if (!expiryText || !signature) return false;
  const expiry = Number(expiryText);
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(getSecret(), `editor_session:${expiry}`);
  return timingSafeEqual(expected, signature);
}
