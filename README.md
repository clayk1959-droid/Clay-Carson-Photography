# Carson & Muller Family Photos

A private family photo-sharing site: collections browsable by person and by
event, click-to-enlarge lightbox with keyboard/swipe navigation, and
captions pulled from IPTC metadata. No accounts or logins — Clay handles all
uploads. This is a plain, standard Next.js app — no proprietary hosting
platform required.

## Command reference

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the site locally at http://localhost:3000, with the caption/date/order/delete/move editor and Sync Gallery button enabled |
| `npm run gallery:sync` | Reads `Gallery Originals`, resizes new/changed photos, regenerates every gallery page and the Collections index |
| `npm run collection:add` | Guided prompts to create a brand-new collection (name, who it's of/from, what event) |
| `npm run hero:set -- "/path/to/photo.tif"` | Replaces the homepage hero photo |
| `npm run save` | Records what changed in `Change Log.md`, commits, and offers to push live |
| `npm run build` / `npm run lint` | Production build check / code-quality check — mainly for troubleshooting |

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Adding or updating galleries

The `gallery:sync` script reads full-resolution originals, resamples them
into a full-view size and a thumbnail size, pulls captions from IPTC
Accessibility Alt Text (falling back to the filename), regenerates each
gallery page, and regenerates the Collections index page — all automatically.

Resizing and metadata extraction are cached per photo (in `.cache/`, never
committed) and skipped whenever a photo hasn't changed since the last sync —
only new or edited photos actually get reprocessed. A sync where nothing
changed finishes in a few seconds regardless of collection size; only
touching/re-saving a source file (or adding/removing one) forces that photo
to be reprocessed.

**Adding photos to an existing collection** (e.g. more Norway photos):
1. Drop the new photos into `Gallery Originals/Norway` (or whichever
   collection folder).
2. Run `npm run gallery:sync`.
3. Check it locally (`npm run dev`), then commit and redeploy (see below).

**Adding a brand-new collection** — no code editing required:
1. Run `npm run collection:add`
2. Answer the questions it asks (the collection's name, who it's of/from,
   and what event or occasion it's from — the last two are optional and
   power the Person/Event filters on the Collections page). It creates the
   matching folder inside `Gallery Originals` and sets everything up for
   you.
3. Copy your photos into that folder.
4. Run `npm run gallery:sync`. This creates the new gallery page AND adds its
   card to the Collections index page automatically.
5. Check it locally, then commit and redeploy.

Note: the script currently checks a hardcoded path
(`/Volumes/Samsung_T5/Website`) for higher-priority metadata before falling
back to the `Gallery Originals` copy. If that drive isn't present, it just
falls back automatically — no changes needed unless that path changes.

## Editing captions, dates, and order locally

While running `npm run dev`, a small pencil icon appears in the corner of
each thumbnail (hover to see it) — click it to edit that photo's caption,
date, or position within the collection. This icon only exists when the
site is running locally; it never appears on the deployed site, since it's
gated on the server side (not just hidden with CSS).

Saving writes to `data/gallery-overrides.json` — it never touches
`Gallery Originals` or a photo's embedded metadata. To actually apply saved
edits to the site, click the **Sync Gallery** button in the bottom-right
corner (also local-only) once you're done editing — it runs
`gallery:sync` for you, so there's no need to switch to a terminal. It's
worth batching several edits before clicking it, since a sync reprocesses
every photo's images and can take a couple of minutes. You can still run
`npm run gallery:sync` by hand instead if you prefer. Either way, check the
result locally, then commit and redeploy as usual — the overrides file is
tracked in git, so edits survive future syncs and deploy along with
everything else via `npm run save`.

## Changing the homepage photo

```bash
npm run hero:set -- "/path/to/photo.tif"
```

Resizes the given photo (TIFF or JPEG) and installs it as the homepage hero
image, replacing whatever was there. Check it with `npm run dev`, then
commit and redeploy as usual.

## Deploying to Vercel

The easiest path, since this is a standard Next.js app:

**Option A — Vercel dashboard (no command line needed)**
1. Push this project to a GitHub repository (or upload it directly in the
   Vercel dashboard).
2. Go to vercel.com, sign in, click "Add New Project," and import the repo.
3. Vercel auto-detects Next.js — click Deploy. No configuration needed.
4. Every future push to the repo auto-deploys.

**Option B — Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel        # deploys a preview
vercel --prod # promotes to production
```

## Custom domain

Once deployed, add your domain under the project's Settings → Domains in the
Vercel dashboard, and update your domain registrar's DNS records as Vercel
instructs (usually a single CNAME or A record). Propagation is typically
minutes to a few hours.

## Saving and publishing changes

Once the site is on GitHub and Vercel (see above), use this any time you've
made a change — whether it's new photos, a text edit, or anything else:

```bash
npm run save
```

It will:
1. Ask what changed (type one line per change, then leave a blank line to finish)
2. Add a new numbered entry to `Change Log.md` with today's date
3. Commit everything with that description
4. Ask if you want to push to GitHub now — if yes, Vercel picks it up and
   deploys automatically within a minute or two

If you're not ready to go live yet, answer "n" when it asks about pushing —
your changes are still saved locally, and you can push later with `git push`.

This replaces the old ChatGPT Sites version-tracking. If you ever need to
roll back to an earlier version, the Vercel dashboard shows every past
deployment with a one-click "Promote to Production" (i.e. rollback) button —
no manual bookkeeping required.
