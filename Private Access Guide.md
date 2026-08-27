# Private Access System — Guide

**Status: live.** Any gallery on the real public site can be marked
private from the editor. The request → approve → login mechanism was
built and proven out against placeholder pages on a separate, isolated
Vercel project first (see "How it was tested" below) — that project still
exists for testing and as the account-admin panel, but the actual
gate now runs for real on `carsonmullerfamily.com` itself, protecting
real galleries and real photos.

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

## How a gallery becomes private

1. In the editor, click "Make Private" on a gallery's card in the
   Galleries index. It stays visible in the public list — no lock icon —
   but clicking into it now shows a request-access gate instead of
   photos, for anyone without a granted account.
2. Run "Sync Gallery." This moves that gallery's images out of `public/`
   (served unauthenticated by Next.js to anyone who knows the URL) into a
   sibling `private-galleries/` tree that isn't, and switches its page to
   a dynamic one that checks the visitor's session on every load.
3. For people already in the account list, grant them access directly
   from the admin page's checkbox grid — no email round trip needed. New
   people click into the gallery and go through the request/approve/
   magic-link flow below.

Two things beyond simply gating the page make this actually private, not
just hidden:

- **The images themselves aren't public.** Every photo in a private
  gallery is served through `app/api/private-photo/`, which re-checks the
  visitor's session and grant on every single request — not just the
  page. There's no direct-URL or guessed-link bypass.
- **Private photos are excluded from the sitewide search.** The
  Galleries-page person/event search index only ever includes photos from
  public collections.

## Why the test project still exists

The original request → approve → login mechanism was built and proven out
against placeholder pages on a second, separate Vercel project
(`clay-carson-photography-private`) before ever being wired to a real
gallery — so nothing about it could affect or break the live public site
while it was still unproven. That project remains useful as the
account-admin panel (the checkbox grid above lives there) and as a place
to test future changes to the login mechanism itself in isolation before
they touch real galleries. It mirrors the existing password-protected
remote editor project, which uses the same "same repo, second Vercel
project, gated by an environment variable" pattern.

## How it's built

- **Database:** Postgres, via Neon, connected through Vercel. Holds access
  requests, approved accounts, per-gallery grants (`gallery_access`),
  login sessions, and login history. The main site's Vercel project has
  its own `DATABASE_URL` pointed at the same database as the
  test/admin project.
  - Schema: `db/schema.sql`
  - Apply schema changes: `npm run db:migrate`
- **File storage:** a private gallery's actual image files live in
  `private-galleries/` at the repo root — committed to git like `public/`
  is, just outside the folder Next.js serves unauthenticated. Read only
  by `app/api/private-photo/`, which re-checks the session on every
  request.
- **Email:** Resend — sends the owner-notification and magic-link emails.
- **The on/off switch for the test/admin project:**
  `PRIVATE_ACCESS_MODE=1`, set only on `clay-carson-photography-private`.
  Every route under `app/test-access/` and `app/api/test-access/` checks
  `lib/private-access-mode.ts` first and returns a plain 404 if that
  variable isn't set. The *real* gallery-gating routes (below) have no
  such switch — they're part of the main site and always active.

### Where the code lives

- `app/test-access/` — the test/admin pages (landing, open, protected,
  admin — the account list and the private-galleries checkbox grid)
- `app/api/test-access/` — the test-project API routes (request, decide,
  verify, revoke, plus the admin grid's grant/revoke route)
- `app/api/gallery-access/` — the real request/decide/verify routes used
  by actual private galleries on the main site
- `app/api/private-photo/` — serves a private gallery's images,
  re-checking the session and grant on every request
- `app/api/collection-privacy/` — the editor's "Make Private" toggle
- `app/collections/GalleryAccessGate.tsx` — the request-access form shown
  in place of a gallery's photos when the visitor isn't granted
- `lib/private-access.ts`, `lib/private-access-mode.ts`, `lib/db.ts` —
  shared helpers, sitting alongside the site's other `lib/` files
- `db/schema.sql` — the database schema
- `scripts/db-migrate.mjs` — applies the schema
- `scripts/sync-gallery.mjs` — branches a private collection's output
  between `public/` and `private-galleries/`, and excludes it from the
  sitewide search index

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

## Trying a real private gallery

- Mark any gallery private from the editor ("Make Private" on its
  Galleries-index card), run "Sync Gallery," and visit that gallery's
  page on `carsonmullerfamily.com` while logged out — you'll see the
  request-access gate instead of photos.
- Submit a request, approve it from the owner-notification email, then
  click the login link in the follow-up email — you'll land on the
  actual gated gallery.
- Grant an already-registered account instantly, no email round trip,
  from the checkbox grid at
  https://clay-carson-photography-private-clayk1959-droids-projects.vercel.app/test-access/admin
  (password-protected with the same password as the pencil-icon editor).

## Testing the login mechanism in isolation

The original placeholder-page test system is still there for trying
changes to the request/approve/login mechanism itself before they touch
a real gallery:
https://clay-carson-photography-private-clayk1959-droids-projects.vercel.app/test-access
— two folders: "Open Me First" (unprotected, just proves the page
renders) and "Try Me Next" (protected — walks through the request/
approve/login flow end to end against a placeholder page).

Hitting `/test-access` on the main site (`carsonmullerfamily.com`)
correctly 404s — that test system has no effect on the real site.

## Possible future work

- [ ] SMS notification to the owner, as an alternative/addition to email.
- [ ] A shorter, easier-to-share URL for the private test/admin site
      (custom domain) — not needed for real galleries, which live on
      `carsonmullerfamily.com` itself.
