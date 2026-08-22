// Whether the private-access test pages/routes should be reachable.
// True locally under `next dev`, and true on exactly one deployment: a
// second Vercel project (same pattern as the password-protected remote
// editor) that sets PRIVATE_ACCESS_MODE=1. Never true on the main public
// site, since that variable is never set there -- these routes 404 there.
export function isPrivateAccessEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.PRIVATE_ACCESS_MODE === "1";
}
