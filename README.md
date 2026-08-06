# Clay Carson Photography

A photo portfolio site: three galleries (Christian, Gulf Shores 2025, Norway),
click-to-enlarge lightbox with keyboard/swipe navigation, and captions pulled
from IPTC metadata. This is a plain, standard Next.js app — no proprietary
hosting platform required.

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

**Adding photos to an existing collection** (e.g. more Norway photos):
1. Drop the new photos into `Gallery Originals/Norway` (or whichever
   collection folder).
2. Run `npm run gallery:sync`.
3. Check it locally (`npm run dev`), then commit and redeploy (see below).

**Adding a brand-new collection** — no code editing required:
1. Run `npm run collection:add`
2. Answer the two questions it asks (the collection's name, and a short label
   for the Collections page). It creates the matching folder inside
   `Gallery Originals` and sets everything up for you.
3. Copy your photos into that folder.
4. Run `npm run gallery:sync`. This creates the new gallery page AND adds its
   card to the Collections index page automatically.
5. Check it locally, then commit and redeploy.

Note: the script currently checks a hardcoded path
(`/Volumes/Samsung_T5/Website`) for higher-priority metadata before falling
back to the `Gallery Originals` copy. If that drive isn't present, it just
falls back automatically — no changes needed unless that path changes.

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
