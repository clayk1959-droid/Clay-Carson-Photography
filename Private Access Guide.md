# Private Access System — Guide

**Status: in testing.** This is a work in progress, not a finished feature.
Nothing here affects the live public site — see "Why it's kept separate"
below.

## The concept

A way to share sensitive photos — starting with photos of a young
grandchild — with specific approved people only. Not the whole internet,
not search engines, not anyone who gets hold of a link.

The requirements this was designed against:

- Serve reasonably sized images, never the original iPhone files
- Strip GPS/EXIF metadata (already true site-wide — the sync script never
  calls `.withMetadata()`, so this was true before this project even started)
- Don't expose original filenames or full-resolution images
- Use unpredictable image URLs
- Require a real login check on every single photo request, not just an
  obscure link
- Keep the whole thing out of search engines
- Log logins
- Give the owner an easy way to kill any one person's access instantly

## Why it's kept separate

So nothing about this system can ever affect or break the live public site
at carsonmullerfamily.com. It's built into the *same codebase* (so one
person — or one Claude session — can maintain everything in one place),
but it only *activates* on a second, separate Vercel project. The main
site's build never even compiles these pages into itself; hitting any of
these URLs on the main site returns a plain 404, same as a page that
doesn't exist.

This mirrors the existing password-protected remote editor project, which
uses the same "same repo, second Vercel project, gated by an environment
variable" pattern.

## How it's built

- **Database:** Postgres, via Neon, connected through Vercel. Holds access
  requests, approved accounts, login sessions, and login history.
  - Schema: `db/schema.sql`
  - Apply schema changes: `npm run db:migrate`
- **File storage:** Vercel Blob — for the actual private photos later. Not
  wired up to real photos yet; this phase only tests the login system
  itself against placeholder pages.
- **Email:** Resend — sends the owner-notification and magic-link emails.
- **The on/off switch:** `PRIVATE_ACCESS_MODE=1`, set as an environment
  variable on the second Vercel project (`clay-carson-photography-private`)
  only. Every private-access page and API route checks
  `lib/private-access-mode.ts` first and returns a plain 404 if that
  variable isn't set.

### Where the code lives

- `app/test-access/` — the pages (landing, open, protected, admin)
- `app/api/test-access/` — the API routes (request, decide, verify, revoke)
- `lib/private-access.ts`, `lib/private-access-mode.ts`, `lib/db.ts` — shared
  helpers, sitting alongside the site's other `lib/` files
- `db/schema.sql` — the database schema
- `scripts/db-migrate.mjs` — applies the schema

## How the login flow works (no passwords, ever)

1. Someone visits the request page and submits their name + email.
2. The owner gets an email with three links: **Approve — 3 months**,
   **Approve — forever**, **Deny**. One click decides it — no separate
   admin login needed for this step.
3. If approved, the person gets a one-time "magic link" by email. Clicking
   it logs them in. No password to create, remember, or leak.
4. Their login session is a random token, stored **hashed** in the
   database — never the raw value. The account behind it can be revoked at
   any moment from the admin page.
5. Session length is chosen per person at approval time: 3 months, or
   forever (either one revocable anytime regardless).

## Testing it yourself

- **Start here:**
  https://clay-carson-photography-private-clayk1959-droids-projects.vercel.app/test-access
  — two folders: "Open Me First" (unprotected, just proves the page
  renders) and "Try Me Next" (protected — walks through the real
  request/approve/login flow end to end, and emails the owner the moment
  someone successfully gets in).
- **Admin view** (every account, when they registered, how long their key
  lasts, a revoke button):
  https://clay-carson-photography-private-clayk1959-droids-projects.vercel.app/test-access/admin
  — **not yet password-protected itself.** Treat that link as sensitive
  until an owner-only login is added in front of it (see below).
- Main site (`carsonmullerfamily.com`) is unaffected by any of this —
  confirmed by hitting `/test-access` there directly, which correctly 404s.

## Still to do before this is real

- [ ] Password-protect the admin page — reuse the existing editor's
      `EDITOR_PASSWORD` login rather than inventing a new password.
- [ ] Wire actual photos into it (Blob storage) instead of the placeholder
      "protected folder" test page.
- [ ] SMS notification to the owner, as an alternative/addition to email.
- [ ] A way to mark a real gallery as private, and to grant access to
      specific galleries rather than everything at once.
- [ ] A shorter, easier-to-share URL for the private site (custom domain).
