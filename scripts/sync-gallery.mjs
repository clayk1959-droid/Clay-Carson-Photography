import { access, copyFile, mkdir, open, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { toSlug, toComponentName } from "./lib/naming.mjs";
import { formatDate } from "./lib/format-date.mjs";
import { computeDisplayOrder, computeIndexCard, computeIndexPhotos, sortIndexCards } from "./lib/photo-ranking.mjs";

// This Mac has 8GB of RAM, and originals can run 50+ megapixels -- sharp's
// own operation cache and multi-threaded pipeline (both outside Node's JS
// heap entirely) add up fast across a big batch and were enough to crash a
// sync outright. Trade a bit of speed for staying inside memory.
sharp.cache(false);
sharp.concurrency(1);

const run = promisify(execFile);

// A live spinner so a big sync (lots of new/changed photos) doesn't look
// frozen during the slow part -- resizing each original. Any console.log
// that needs to print while the spinner is running should go through
// logLine() instead, so it doesn't get smeared onto the spinner's line.
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinnerFrameIndex = 0;
let spinnerStatusText = "";
let spinnerTimer = null;

function spinnerRender() {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`${spinnerFrames[spinnerFrameIndex]} ${spinnerStatusText}`);
  spinnerFrameIndex = (spinnerFrameIndex + 1) % spinnerFrames.length;
}

function startSpinner() {
  if (!process.stdout.isTTY || spinnerTimer) return;
  spinnerTimer = setInterval(spinnerRender, 100);
}

function setSpinnerStatus(text) {
  spinnerStatusText = text;
  if (!process.stdout.isTTY) console.log(text);
}

function stopSpinner() {
  if (!spinnerTimer) return;
  clearInterval(spinnerTimer);
  spinnerTimer = null;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

function logLine(text) {
  if (spinnerTimer) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
  console.log(text);
}

const root = process.cwd();
const sourceRoot = path.join(root, "Gallery Originals");
const protectedMetadataRoot = "/Volumes/Samsung_T5/Website";
const temporaryRoot = path.join(root, "work", "gallery-sync-temp");
await rm(temporaryRoot, { recursive: true, force: true });
await mkdir(temporaryRoot, { recursive: true });

// Resizing a photo (TIFF conversion + two sharp passes) is by far the
// slowest part of a sync. This cache holds one resized full-size and
// thumbnail copy per original photo, keyed by filename (not by its
// position number, which shifts whenever photos are added/reordered
// elsewhere in the alphabet). A cache entry is reused as long as it's
// newer than the source file's last-modified time — otherwise the photo
// is reprocessed and the cache is refreshed. This lets a sync over
// hundreds of unchanged photos finish in seconds instead of minutes.
const cacheRoot = path.join(root, ".cache", "gallery-sync");

async function isFresh(cachePath, sourceMtimeMs) {
  try {
    const cacheStat = await stat(cachePath);
    return cacheStat.mtimeMs >= sourceMtimeMs;
  } catch {
    return false;
  }
}

const overridesPath = path.join(root, "data", "gallery-overrides.json");
let overrides = {};
try {
  overrides = JSON.parse(await readFile(overridesPath, "utf8"));
} catch {
  overrides = {};
}

// Which photo (by original filename) represents a collection on its
// Collections-page card, and how it's cropped — set via the pencil-icon
// editor's "Cover photo" picker (or `npm run collection:cover`). Falls
// back to the first visible photo, centered, when a collection has no
// entry here yet.
const collectionCoverOverridesPath = path.join(root, "data", "collection-overrides.json");
let collectionCoverOverrides = {};
try {
  collectionCoverOverrides = JSON.parse(await readFile(collectionCoverOverridesPath, "utf8"));
} catch {
  collectionCoverOverrides = {};
}

// You don't need to edit this array by hand for a new collection — drop a
// non-empty folder into "Gallery Originals" and the next `gallery:sync` run
// registers it automatically below, using the folder name as the title.
// Empty folders are ignored until they actually have photos in them. Once
// auto-added, you can still hand-edit an entry's title/subtitle here any
// time.
//   folder:     exact folder name inside "Gallery Originals"
//   slug:       URL-safe id, e.g. "norway" -> /collections/norway
//   title:      heading shown on the gallery page and index card
//   component:  a unique PascalCase React component name
//   subtitle:   optional extra text on the gallery page itself (e.g. a date)
// A collection's cover photo (which photo represents it on the Collections
// page, and how it's cropped) isn't set here — it lives in
// data/collection-overrides.json, set via the pencil-icon editor's "Cover
// photo" picker (or `npm run collection:cover`). Defaults to the first
// visible photo, centered, when unset.
// Person/Event tags shown on the Collections page are read per photo from
// Photo Mechanic's IPTC "Persons Shown" and "Event" fields — untagged photos
// just don't contribute a tag, they still get a caption (from IPTC
// Accessibility Alt Text, or the creation date + filename if that's not set
// either). Per-photo caption/date/order corrections live in
// data/gallery-overrides.json (edit via the pencil icon shown on each photo
// when running `npm run dev`, or by hand) — they're applied on top of the
// auto-detected data below and survive future syncs.
const collections = [
  { folder: "Janet Buys a car", slug: "janet-buys-a-car", title: "Janet Buys a car", component: "JanetBuysACarPage", subtitle: null },
  { folder: "Nova Scotia Trip", slug: "nova-scotia", title: "Nova Scotia", component: "NovaScotiaPage", subtitle: null },
  { folder: "Norway Cruise", slug: "norway-cruise", title: "Norway Cruise", component: "NorwayCruisePage", subtitle: null },
  { folder: "Rhine River Cruise", slug: "rhine-river-cruise", title: "Rhine River Cruise", component: "RhineRiverCruisePage", subtitle: null },
];

// Auto-discover any "Gallery Originals" folder not already listed above.
// Folders with no photos yet are skipped entirely (not registered, no page)
// until they actually have something in them.
{
  const knownFolders = new Set(collections.map((c) => c.folder));
  const originalsEntries = await readdir(sourceRoot, { withFileTypes: true });
  const candidateFolders = originalsEntries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((folder) => !knownFolders.has(folder));

  let discoveredAny = false;
  for (const folder of candidateFolders) {
    const files = (await readdir(path.join(sourceRoot, folder))).filter((f) => !f.startsWith("."));
    if (files.length === 0) continue; // ignore empty folders until they have photos

    const title = folder;
    const slug = toSlug(title);
    const component = toComponentName(title, (candidate) => collections.some((c) => c.component === candidate));
    collections.push({ folder, slug, title, component, subtitle: null });
    discoveredAny = true;
    console.log(`Discovered new collection: "${folder}" → /collections/${slug}`);
  }

  if (discoveredAny) {
    const thisScriptPath = fileURLToPath(import.meta.url);
    const scriptText = await readFile(thisScriptPath, "utf8");
    const marker = "const collections = [";
    const markerIndex = scriptText.indexOf(marker);
    const bracketIndex = markerIndex === -1 ? -1 : scriptText.indexOf("\n];", markerIndex);
    if (markerIndex !== -1 && bracketIndex !== -1) {
      const insertPoint = bracketIndex + 1;
      const newEntries = candidateFolders
        .filter((folder) => collections.some((c) => c.folder === folder))
        .map((folder) => {
          const entry = collections.find((c) => c.folder === folder);
          return `  { folder: ${JSON.stringify(entry.folder)}, slug: ${JSON.stringify(entry.slug)}, title: ${JSON.stringify(entry.title)}, component: ${JSON.stringify(entry.component)}, subtitle: null },\n`;
        })
        .join("");
      const updatedScript = scriptText.slice(0, insertPoint) + newEntries + scriptText.slice(insertPoint);
      await writeFile(thisScriptPath, updatedScript);
    }
  }
}

// Auto-remove any registered collection whose source folder has been
// deleted entirely from "Gallery Originals" (as opposed to merely being
// empty, which is handled separately below) — lets a deleted folder
// disappear from the site on the next sync instead of crashing, without
// needing this file hand-edited afterward.
{
  const missingFolders = [];
  for (const collection of collections) {
    const exists = await access(path.join(sourceRoot, collection.folder))
      .then(() => true)
      .catch(() => false);
    if (!exists) missingFolders.push(collection.folder);
  }

  if (missingFolders.length > 0) {
    for (const folder of missingFolders) {
      const collection = collections.find((c) => c.folder === folder);
      await rm(path.join(root, "app", "collections", collection.slug), { recursive: true, force: true });
      await rm(path.join(root, "public", "galleries", collection.slug), { recursive: true, force: true });
      await rm(path.join(root, "public", "gallery-thumbnails", collection.slug), { recursive: true, force: true });
      await rm(path.join(cacheRoot, collection.slug), { recursive: true, force: true });
      await rm(path.join(root, "data", "photo-data", `${collection.slug}.json`), { force: true });
      console.log(`Removed collection "${collection.title}" — its folder no longer exists in Gallery Originals`);
    }

    const kept = collections.filter((c) => !missingFolders.includes(c.folder));
    collections.length = 0;
    collections.push(...kept);

    const thisScriptPath = fileURLToPath(import.meta.url);
    let scriptText = await readFile(thisScriptPath, "utf8");
    for (const folder of missingFolders) {
      const needle = `folder: ${JSON.stringify(folder)}`;
      const needleIndex = scriptText.indexOf(needle);
      if (needleIndex === -1) continue;
      const entryStartMarker = scriptText.lastIndexOf("\n  {", needleIndex);
      const closeIndex = scriptText.indexOf("},\n", needleIndex);
      if (entryStartMarker === -1 || closeIndex === -1) continue;
      const entryStart = entryStartMarker + 1;
      const entryEnd = closeIndex + "},\n".length;
      scriptText = scriptText.slice(0, entryStart) + scriptText.slice(entryEnd);
    }
    await writeFile(thisScriptPath, scriptText);
  }
}

// Lets the local-only "Move to…" editor action (app/api/gallery-move)
// resolve a collection slug back to its "Gallery Originals" folder name
// without needing to import this whole script.
await mkdir(cacheRoot, { recursive: true });
await writeFile(
  path.join(cacheRoot, "collections.json"),
  JSON.stringify(
    collections.map((collection) => ({
      slug: collection.slug,
      folder: collection.folder,
      title: collection.title,
    })),
    null,
    2,
  ),
);

// A committed (not gitignored) copy of the same list, keyed only by slug —
// the remote editor's API routes run where "Gallery Originals" doesn't
// exist, so they use this as an allowlist of valid collection slugs instead
// of the cache file above.
const photoDataRoot = path.join(root, "data", "photo-data");
await mkdir(photoDataRoot, { recursive: true });
await writeFile(
  path.join(photoDataRoot, "_collections.json"),
  `${JSON.stringify(
    collections.map((collection) => ({ slug: collection.slug, title: collection.title })),
    null,
    2,
  )}\n`,
);

function quoted(value) {
  return JSON.stringify(value);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

// Pulls every <rdf:li> text out of a given Iptc4xmpExt tag block — works for
// both "PersonInImage" (an rdf:Bag, possibly several people) and "Event" (an
// rdf:Alt, one value in practice) since only the <rdf:li> contents matter,
// not which kind of list wraps them. Untagged photos just return [].
function parseIptcExtList(xml, tag) {
  const block = xml.match(new RegExp(`<Iptc4xmpExt:${tag}>[\\s\\S]*?</Iptc4xmpExt:${tag}>`))?.[0];
  if (!block) return [];
  return [...block.matchAll(/<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/g)]
    .map((m) => decodeXml(m[1].trim()))
    .filter(Boolean);
}

// The XMP/IPTC metadata block this function reads always lives near the
// start of the file (confirmed a few KB in, even in 75MB+ uncompressed
// scanner TIFFs), so only reading the first couple MB avoids pulling a
// huge original entirely into memory just to find a small tag -- reading
// dozens of 50-75MB TIFFs as full UTF-8 strings in one run is what
// crashed Node with an out-of-memory error.
async function readMetadataText(source) {
  const MAX_BYTES = 2 * 1024 * 1024;
  const handle = await open(source, "r");
  try {
    const { size } = await handle.stat();
    const length = Math.min(MAX_BYTES, size);
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, 0);
    return buffer.toString("utf8");
  } finally {
    await handle.close();
  }
}

async function readMetadata(source, fallback) {
  const contents = await readMetadataText(source);
  const altText = contents.match(
    /<Iptc4xmpCore:AltTextAccessibility>[\s\S]*?<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>[\s\S]*?<\/Iptc4xmpCore:AltTextAccessibility>/,
  )?.[1]?.trim();
  // No Alt Text set — a bare camera filename like "L1020539" makes for a
  // useless caption, so fall back to the gallery's own name instead.
  const description = altText ? decodeXml(altText) : fallback;

  // photoshop:DateCreated / xmp:CreateDate is the photo's real original
  // capture date, embedded by Photo Mechanic/Photoshop from the camera's
  // own metadata. Prefer it over `sips -g creation`, which often just
  // reflects whenever the file was last saved/converted/copied -- not
  // when the photo was actually taken.
  const xmpDate = contents.match(/(?:photoshop:DateCreated|xmp:CreateDate)="(\d{4}-\d{2}-\d{2})/)?.[1];
  let date = xmpDate ?? null;
  if (!date) {
    const { stdout } = await run("sips", ["-g", "creation", source]);
    const creation = stdout.match(/^\s*creation:\s*(.+)$/m)?.[1]?.trim();
    const match = creation?.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
    date = match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  }

  const person = parseIptcExtList(contents, "PersonInImage");
  const event = parseIptcExtList(contents, "Event");
  return { date, description, person, event };
}

const indexCards = [];
// Flat list of every visible photo across every collection, for the
// person/event search on the Galleries page — searching needs to find a
// photo no matter which collection it's filed under, not just filter
// which collection cards show.
const indexPhotos = [];

startSpinner();
for (const collection of collections) {
  const sourceDirectory = path.join(sourceRoot, collection.folder);
  const filenames = (await readdir(sourceDirectory))
    .filter((filename) => !filename.startsWith("."))
    .sort();

  if (filenames.length === 0) {
    // Ignore empty folders until they actually have photos — clean up any
    // page and images generated from a previous run when it still had some.
    await rm(path.join(root, "app", "collections", collection.slug), { recursive: true, force: true });
    await rm(path.join(root, "public", "galleries", collection.slug), { recursive: true, force: true });
    await rm(path.join(root, "public", "gallery-thumbnails", collection.slug), { recursive: true, force: true });
    await rm(path.join(root, "private-galleries", "galleries", collection.slug), { recursive: true, force: true });
    await rm(path.join(root, "private-galleries", "gallery-thumbnails", collection.slug), {
      recursive: true,
      force: true,
    });
    await rm(path.join(photoDataRoot, `${collection.slug}.json`), { force: true });
    logLine(`${collection.title}: 0 photographs — skipped (folder is empty)`);
    continue;
  }

  // Captured once, the first time a collection is ever synced, then frozen
  // -- this is what the Collections index sorts newest-first by. Reading
  // birthtime fresh every sync instead would seem equivalent day-to-day,
  // but would silently reset to "now" if the folder were ever recreated
  // (moved, restored from a backup, reorganized), quietly reshuffling the
  // whole index. Existing collections synced before this feature existed
  // get backfilled from their current birthtime on their next sync -- the
  // best available stand-in for a real historical record.
  if (!collectionCoverOverrides[collection.slug]?.firstSyncedAt) {
    const { birthtime } = await stat(sourceDirectory);
    collectionCoverOverrides[collection.slug] = {
      ...(collectionCoverOverrides[collection.slug] ?? {}),
      firstSyncedAt: birthtime.toISOString(),
    };
  }

  // A private collection's actual image files never go under public/ --
  // that folder is served unauthenticated by Next.js to anyone who knows
  // (or guesses) the URL, which would make the page-level gate below
  // meaningless. They go to a same-shaped tree outside public/ instead,
  // read only by the authenticated app/api/private-photo route. If a
  // collection's privacy flag flipped since the last sync, its old
  // location's output is removed so nothing lingers somewhere it
  // shouldn't (or wastes space somewhere it no longer needs to).
  const isPrivateCollection = collectionCoverOverrides[collection.slug]?.private === true;
  const outputRoot = path.join(root, isPrivateCollection ? "private-galleries" : "public");
  const staleRoot = path.join(root, isPrivateCollection ? "public" : "private-galleries");
  await rm(path.join(staleRoot, "galleries", collection.slug), { recursive: true, force: true });
  await rm(path.join(staleRoot, "gallery-thumbnails", collection.slug), { recursive: true, force: true });

  const fullDirectory = path.join(outputRoot, "galleries", collection.slug);
  const thumbnailDirectory = path.join(outputRoot, "gallery-thumbnails", collection.slug);
  const cacheFullDirectory = path.join(cacheRoot, collection.slug, "full");
  const cacheThumbnailDirectory = path.join(cacheRoot, collection.slug, "thumbnails");
  await mkdir(fullDirectory, { recursive: true });
  await mkdir(thumbnailDirectory, { recursive: true });
  await mkdir(cacheFullDirectory, { recursive: true });
  await mkdir(cacheThumbnailDirectory, { recursive: true });

  // Reading a photo's embedded caption/date means scanning the whole
  // original file (they run tens of megabytes each), which dwarfs
  // everything else once image resizing itself is cached. Cache the
  // parsed result too, keyed by the same freshness check.
  const metadataCachePath = path.join(cacheRoot, collection.slug, "metadata.json");
  let metadataCache = {};
  try {
    metadataCache = JSON.parse(await readFile(metadataCachePath, "utf8"));
  } catch {
    metadataCache = {};
  }

  const photographData = [];
  const collectionOverrides = overrides[collection.slug] ?? {};
  const expectedBasenames = new Set();
  let reusedCount = 0;
  let processedCount = 0;
  let hiddenCount = 0;

  for (const [index, filename] of filenames.entries()) {
    const number = String(index + 1).padStart(2, "0");
    setSpinnerStatus(`${collection.title}: ${index + 1}/${filenames.length} — ${filename}`);

    const isHidden = collectionOverrides[filename]?.hidden === true;
    if (isHidden) hiddenCount += 1;

    const source = path.join(sourceDirectory, filename);
    const protectedMetadataSource = path.join(
      protectedMetadataRoot,
      collection.folder,
      filename,
    );
    let metadataSource = protectedMetadataSource;
    try {
      await access(protectedMetadataSource);
    } catch {
      metadataSource = source;
    }

    const basename = `${collection.slug}-${number}.jpg`;
    expectedBasenames.add(basename);
    const fullPath = path.join(fullDirectory, basename);
    const thumbnailPath = path.join(thumbnailDirectory, basename);
    const cacheFullPath = path.join(cacheFullDirectory, `${filename}.jpg`);
    const cacheThumbnailPath = path.join(cacheThumbnailDirectory, `${filename}.jpg`);

    const sourceMtimeMs = (await stat(source)).mtimeMs;
    const canReuse =
      (await isFresh(cacheFullPath, sourceMtimeMs)) &&
      (await isFresh(cacheThumbnailPath, sourceMtimeMs));

    if (canReuse) {
      await copyFile(cacheFullPath, fullPath);
      await copyFile(cacheThumbnailPath, thumbnailPath);
      reusedCount += 1;
    } else {
      const isTiff = /\.tiff?$/i.test(filename);
      const workingSource = isTiff
        ? path.join(temporaryRoot, `${collection.slug}-${number}.jpg`)
        : source;
      if (isTiff) {
        await run("sips", ["-s", "format", "jpeg", source, "--out", workingSource]);
      }
      await sharp(workingSource, { unlimited: true })
        .rotate()
        .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(fullPath);
      await sharp(workingSource, { unlimited: true })
        .rotate()
        // Grid thumbnails never render past ~350px CSS-wide even on the
        // widest desktop layout -- 750px covers a sharp 2x-retina display
        // at that size with real headroom, down from 1200px which was
        // serving 3-4x more resolution than any screen actually shows.
        .resize({ width: 750, height: 750, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(thumbnailPath);
      await copyFile(fullPath, cacheFullPath);
      await copyFile(thumbnailPath, cacheThumbnailPath);
      processedCount += 1;
    }

    const metadataSourceMtimeMs = (await stat(metadataSource)).mtimeMs;
    const cachedMetadata = metadataCache[filename];
    const auto =
      cachedMetadata && cachedMetadata.mtimeMs === metadataSourceMtimeMs
        ? cachedMetadata
        : await readMetadata(metadataSource, collection.title);
    metadataCache[filename] = {
      mtimeMs: metadataSourceMtimeMs,
      date: auto.date,
      description: auto.description,
      person: auto.person ?? [],
      event: auto.event ?? [],
    };

    const override = collectionOverrides[filename] ?? {};
    const date = override.date ?? auto.date;
    const description = override.caption ?? auto.description;
    const caption = date ? `${formatDate(date)} — ${description}` : description;
    const outputMetadata = await sharp(fullPath).metadata();
    photographData.push({
      filename,
      date,
      description,
      caption,
      altText: description,
      person: auto.person ?? [],
      event: auto.event ?? [],
      width: outputMetadata.width,
      height: outputMetadata.height,
      hidden: isHidden,
    });
  }

  // Remove public output left over from photos that no longer exist in
  // this collection (deleted or renamed originals).
  for (const directory of [fullDirectory, thumbnailDirectory]) {
    const existing = await readdir(directory);
    for (const entry of existing) {
      if (!expectedBasenames.has(entry)) {
        await rm(path.join(directory, entry), { force: true });
      }
    }
  }

  // Same cleanup for the resize cache, keyed by original filename.
  const currentFilenames = new Set(filenames);
  for (const directory of [cacheFullDirectory, cacheThumbnailDirectory]) {
    const existing = await readdir(directory);
    for (const entry of existing) {
      if (!currentFilenames.has(entry.replace(/\.jpg$/, ""))) {
        await rm(path.join(directory, entry), { force: true });
      }
    }
  }

  for (const filename of Object.keys(metadataCache)) {
    if (!currentFilenames.has(filename)) delete metadataCache[filename];
  }
  await writeFile(metadataCachePath, JSON.stringify(metadataCache, null, 2));

  const displayOrder = computeDisplayOrder(photographData, collectionOverrides);
  const visibleCount = displayOrder.length;
  const coverOverride = collectionCoverOverrides[collection.slug] ?? {};

  // Everything a page needs to render this collection, minus anything that
  // requires "Gallery Originals" to (re)compute — committed to git so the
  // remote editor can patch it directly (caption/date/order/hidden/cover)
  // without needing the source photos at all.
  await writeFile(
    path.join(photoDataRoot, `${collection.slug}.json`),
    `${JSON.stringify({ photographData, displayOrder }, null, 2)}\n`,
  );

  const otherCollectionsJson = JSON.stringify(
    collections
      .filter((other) => other.slug !== collection.slug)
      .map((other) => ({ slug: other.slug, title: other.title })),
    null,
    2,
  );

  // Private collections get a dynamic page that re-checks the visitor's
  // session and gallery_access on every request (see the plan's leak #2 --
  // a static page can't gate anything), pulling photos through the
  // authenticated /api/private-photo route instead of a public/ URL, and
  // showing GalleryAccessGate in place of the gallery when unauthorized.
  const page = isPrivateCollection
    ? `import { cookies } from "next/headers";
import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { GalleryAccessGate } from "../GalleryAccessGate";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import { getAccountForSession, hasGalleryAccess, SESSION_COOKIE_NAME } from "../../../lib/private-access";
import data from "../../../data/photo-data/${collection.slug}.json";

export const dynamic = "force-dynamic";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: \`/api/private-photo/galleries/${collection.slug}/${collection.slug}-\${String(number).padStart(2, "0")}.jpg\`,
}));

const hiddenPhotographs = data.photographData
  .map((photo, index) => ({
    ...photo,
    src: \`/api/private-photo/galleries/${collection.slug}/${collection.slug}-\${String(index + 1).padStart(2, "0")}.jpg\`,
  }))
  .filter((photo) => photo.hidden);

const otherCollections = ${otherCollectionsJson};

const collectionSubtitle: string | null = ${quoted(collection.subtitle)};

export default async function ${collection.component}() {
  // The editor (local dev, or the password-gated remote-editor deployment)
  // always sees every gallery, private or not, for editing -- the family
  // access grant is a visitor concept, not something that should also gate
  // the person managing privacy in the first place.
  const editorEnabled = isEditorEnabled();
  let authorized = editorEnabled;
  if (!authorized) {
    const cookieStore = await cookies();
    const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    authorized = account ? await hasGalleryAccess(account.account_id, ${quoted(collection.slug)}) : false;
  }

  if (!authorized) {
    return (
      <main className="subpage collection-page">
        <SiteHeader showHome />
        <header className="collection-heading">
          <a href="/collections">← Galleries</a>
          <h1>${collection.title}</h1>
        </header>
        <GalleryAccessGate gallerySlug=${quoted(collection.slug)} />
        <SiteFooter />
      </main>
    );
  }

  const remote = isRemoteEditorMode();
  const photoCountText = data.displayOrder.length + " Photos";
  const subtitle = collectionSubtitle ? collectionSubtitle + " \u00b7 " + photoCountText : photoCountText;
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Galleries</a>
        <h1>${collection.title}</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name=${quoted(collection.title)}
        slug=${quoted(collection.slug)}
        photographs={photographs}
        hiddenPhotographs={hiddenPhotographs}
        otherCollections={remote ? [] : otherCollections}
        editable={editorEnabled}
        remoteMode={remote}
      />

      <SiteFooter />
    </main>
  );
}
`
    : `import { SiteHeader } from "../../SiteHeader";\nimport { SiteFooter } from "../../SiteFooter";\nimport { Gallery } from "../Gallery";\nimport { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";\nimport data from "../../../data/photo-data/${collection.slug}.json";\n\nconst photographs = data.displayOrder.map((number) => ({\n  ...data.photographData[number - 1],\n  src: \`/galleries/${collection.slug}/${collection.slug}-\${String(number).padStart(2, "0")}.jpg\`,\n}));\n\nconst hiddenPhotographs = data.photographData\n  .map((photo, index) => ({\n    ...photo,\n    src: \`/galleries/${collection.slug}/${collection.slug}-\${String(index + 1).padStart(2, "0")}.jpg\`,\n  }))\n  .filter((photo) => photo.hidden);\n\nconst otherCollections = ${otherCollectionsJson};\n\nconst collectionSubtitle: string | null = ${quoted(collection.subtitle)};\n\nexport default function ${collection.component}() {\n  const remote = isRemoteEditorMode();\n  const photoCountText = data.displayOrder.length + \" Photos\";\n  const subtitle = collectionSubtitle ? collectionSubtitle + \" \u00b7 \" + photoCountText : photoCountText;\n  return (\n    <main className="subpage collection-page">\n      <SiteHeader showHome />\n      <header className="collection-heading">\n        <a href="/collections">← Galleries</a>\n        <h1>${collection.title}</h1>\n        <p>{subtitle}</p>\n      </header>\n      <Gallery\n        name=${quoted(collection.title)}\n        slug=${quoted(collection.slug)}\n        photographs={photographs}\n        hiddenPhotographs={hiddenPhotographs}\n        otherCollections={remote ? [] : otherCollections}\n        editable={isEditorEnabled()}\n        remoteMode={remote}\n      />\n\n      <SiteFooter />\n    </main>\n  );\n}\n`;
  const collectionPageDirectory = path.join(root, "app", "collections", collection.slug);
  await mkdir(collectionPageDirectory, { recursive: true });
  await writeFile(path.join(collectionPageDirectory, "page.tsx"), page);
  logLine(
    `${collection.title}: ${visibleCount} photographs (${reusedCount} unchanged, ${processedCount} processed${hiddenCount ? `, ${hiddenCount} hidden` : ""})`,
  );

  indexCards.push(
    computeIndexCard({
      slug: collection.slug,
      title: collection.title,
      photographData,
      collectionOverrides,
      displayOrder,
      coverOverride,
    }),
  );
  // A private collection's photos never enter the sitewide person/event
  // search index -- that index is served flat and ungated on the public
  // Galleries page, so including them would let anyone search a name into
  // seeing a private gallery's photos without ever passing the gate.
  if (!isPrivateCollection) {
    indexPhotos.push(
      ...computeIndexPhotos({ slug: collection.slug, title: collection.title, photographData, displayOrder }),
    );
  }
}

await writeFile(collectionCoverOverridesPath, `${JSON.stringify(collectionCoverOverrides, null, 2)}\n`);

await writeFile(
  path.join(photoDataRoot, "_index.json"),
  `${JSON.stringify({ cards: sortIndexCards(indexCards, collectionCoverOverrides), photos: indexPhotos }, null, 2)}\n`,
);

const indexPage = `import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { CollectionsIndex } from "./CollectionsIndex";
import { isEditorEnabled } from "../../lib/editor-mode";
import indexData from "../../data/photo-data/_index.json";

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Galleries</h1>
        <CollectionsIndex cards={indexData.cards} photos={indexData.photos} editable={isEditorEnabled()} />
      </section>

      <SiteFooter />
    </main>
  );
}
`;
await writeFile(path.join(root, "app", "collections", "page.tsx"), indexPage);
stopSpinner();
console.log("Collections index page regenerated.");

await rm(temporaryRoot, { recursive: true, force: true });
