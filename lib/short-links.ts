import { randomBytes } from "node:crypto";
import { getPool } from "./db";

// 6 random bytes -> 8 base64url characters -- short enough to read cleanly
// in a text message, random enough (48 bits) that guessing one isn't a
// realistic concern for what these protect (an access-request decision).
function generateCode(): string {
  return randomBytes(6).toString("base64url");
}

// Stores targetUrl behind a short /s/<code> redirect and returns the full
// short URL. Links don't expire -- the destination routes (like the
// gallery-access decide link) are already self-protecting against reuse
// after a decision is made, so there's nothing extra to enforce here.
export async function createShortLink(origin: string, targetUrl: string): Promise<string> {
  const code = generateCode();
  await getPool().query("insert into short_links (code, target_url) values ($1, $2)", [code, targetUrl]);
  return `${origin}/s/${code}`;
}
