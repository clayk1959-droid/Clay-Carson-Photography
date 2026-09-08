# Clay Carson Photography — project notes

See `~/.claude/CLAUDE.md` for durable cross-project rules (docs
discipline, Vercel/git gotchas, image resize conventions, etc.) — this
file only covers what's specific to *this* project.

## What this is

Clay's own photography site. Next.js (App Router), deployed on Vercel,
GitHub-backed. A sibling project, `marck-beggs-website` (separate repo,
separate Vercel project, at `/Volumes/Samsung_T5/marck-beggs-website`),
reuses several patterns from here — check there first before
re-deriving something that already works on this side, and vice versa.

- GitHub: `clayk1959-droid/Clay-Carson-Photography`
- Vercel project: `clay-carson-photography` (custom domain
  `carsonmullerfamily.com`)
- Second Vercel project: a password-gated remote editor, live since
  2026-08-19 — see project memory for details.

## Full docs

- **`Change Log.md`** — plain-language version history, most recent
  first. Update on every ship.
- **`Site Guide.html`** — the fuller technical reference (architecture,
  commands, env vars, content data files). Update on every ship.
- **`Private Access Guide.html`** / **`.md`** — the private-access
  (family login) feature, written high-contrast/large-text for Clay's
  own low vision.
- **`README.md`** — standard repo readme.

## Stack / services

- Database: Neon Postgres (`DATABASE_URL` + pooled/unpooled variants,
  `PG*`/`POSTGRES_*` vars). Migrations via `npm run db:migrate`.
- Email: Resend (`RESEND_API_KEY`), verified sending domain
  `mail.carsonmullerfamily.com`.
- SMS: Twilio (`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/
  `TWILIO_PHONE_NUMBER`) — A2P 10DLC campaign verified and delivery
  confirmed 2026-09-03. This is the account `marck-beggs-website`
  reuses directly rather than registering its own campaign.
- File storage: Vercel Blob (`BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`).
- Editor auth: `EDITOR_PASSWORD` (see `lib/editor-auth.ts` pattern —
  also reused, extended for multi-user, on the Marck site).

## Key scripts (`package.json`)

- `npm run dev` / `build` / `start` / `lint` — standard Next.js.
- `npm run gallery:sync` — syncs/resizes photo galleries (the resize
  rules in the global CLAUDE.md come from `scripts/sync-gallery.mjs`).
- `npm run save` — see `scripts/save.mjs`.
- `npm run collection:add` / `collection:cover` — gallery collection
  management.
- `npm run db:migrate` — Postgres migrations.
- `npm run submissions:pull` — pulls Marck-style photo submissions
  (see project memory: photo submission feature, shipped V140).

## Known constraints

- No staging environment — all testing hits the real GitHub repo and
  real Vercel deployments. Clean up test commits/data after verifying.
- Multiple concurrent Claude Code sessions sometimes run against this
  same folder (see global CLAUDE.md) — expect occasional push
  rejections from your own other session, not necessarily a bug.
