// Everyone allowed into the password-protected remote editor -- the site
// owner via EDITOR_PASSWORD (unchanged, for backward compatibility), plus
// any additional named collaborators via EDITOR_USERS (one "name:password"
// pair per line, e.g. "Barry:some-password"). This module is also used by
// the private-access admin panel's login, which shares the same
// plumbing/owner password.
//
// Each person's own password doubles as their session cookie's signing key
// (see session-cookie.ts) -- changing one person's password invalidates
// only their own sessions, not everyone else's.
export type EditorUser = { name: string; password: string };

export const OWNER_NAME = "Clay";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function parseAdditionalUsers(): EditorUser[] {
  const raw = process.env.EDITOR_USERS;
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) return [];
      const name = line.slice(0, separatorIndex).trim();
      const password = line.slice(separatorIndex + 1).trim();
      return name && password ? [{ name, password }] : [];
    });
}

export function getEditorUsers(): EditorUser[] {
  const users: EditorUser[] = [];
  if (process.env.EDITOR_PASSWORD) {
    users.push({ name: OWNER_NAME, password: process.env.EDITOR_PASSWORD });
  }
  return [...users, ...parseAdditionalUsers()];
}

// Looks a person up by name -- used both at login (name + password form)
// and to verify a session cookie's signature (using that same person's
// password as the key).
export function findEditorUser(name: string): EditorUser | null {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;
  return getEditorUsers().find((user) => user.name.toLowerCase() === normalized) ?? null;
}

export function checkEditorPassword(user: EditorUser, submittedPassword: string): boolean {
  return timingSafeEqual(user.password, submittedPassword);
}
