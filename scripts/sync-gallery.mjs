import { access, copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { toSlug, toComponentName } from "./lib/naming.mjs";

const run = promisify(execFile);

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

// You don't need to edit this array by hand for a new collection — drop a
// non-empty folder into "Gallery Originals" and the next `gallery:sync` run
// registers it automatically below, using the folder name as the title.
// Empty folders are ignored until they actually have photos in them. Once
// auto-added, you can still hand-edit an entry's title/subtitle/coverPhoto
// here any time.
//   folder:     exact folder name inside "Gallery Originals"
//   slug:       URL-safe id, e.g. "norway" -> /collections/norway
//   title:      heading shown on the gallery page and index card
//   component:  a unique PascalCase React component name
//   subtitle:   optional extra text on the gallery page itself (e.g. a date)
//   coverPhoto: optional 1-based photo number to use as the index card thumbnail (defaults to 1)
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
  { folder: "Nova Scotia", slug: "nova-scotia", title: "Nova Scotia", component: "NovaScotiaPage", subtitle: null },
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

function humanizeFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^(BEACH|NORWAY)\s*[-_]\s*/i, "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

async function readMetadata(source, fallback) {
  const { stdout } = await run("sips", ["-g", "creation", "-g", "description", source]);
  const creation = stdout.match(/^\s*creation:\s*(.+)$/m)?.[1]?.trim();
  const contents = (await readFile(source)).toString("utf8");
  const altText = contents.match(
    /<Iptc4xmpCore:AltTextAccessibility>[\s\S]*?<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>[\s\S]*?<\/Iptc4xmpCore:AltTextAccessibility>/,
  )?.[1]?.trim();
  const description = altText ? decodeXml(altText) : humanizeFilename(fallback);
  const match = creation?.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  const date = match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  const person = parseIptcExtList(contents, "PersonInImage");
  const event = parseIptcExtList(contents, "Event");
  return { date, description, person, event };
}

const indexCards = [];

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
    console.log(`${collection.title}: 0 photographs — skipped (folder is empty)`);
    continue;
  }

  const fullDirectory = path.join(root, "public", "galleries", collection.slug);
  const thumbnailDirectory = path.join(root, "public", "gallery-thumbnails", collection.slug);
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

    if (collectionOverrides[filename]?.hidden === true) {
      // Deleted from the site via the local editor. The original file in
      // Gallery Originals is never touched — this only skips generating
      // output for it, so "Reset to auto-detected" (or removing the
      // override by hand) brings it right back.
      photographData.push({
        filename,
        date: null,
        description: "",
        caption: "",
        altText: "",
        person: [],
        event: [],
        width: 0,
        height: 0,
      });
      hiddenCount += 1;
      continue;
    }

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
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
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
        : await readMetadata(metadataSource, filename);
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

  const ranked = photographData
    .map((photograph, index) => {
      const naturalRank = index + 1;
      const overrideOrder = collectionOverrides[photograph.filename]?.order;
      return { naturalRank, sortRank: overrideOrder ?? naturalRank, hasOverride: overrideOrder !== undefined };
    })
    .filter((entry) => !collectionOverrides[filenames[entry.naturalRank - 1]]?.hidden);
  ranked.sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
    // A photo explicitly moved to this position wins a tie against a photo
    // that merely landed here by natural (filename) order.
    if (a.hasOverride !== b.hasOverride) return a.hasOverride ? -1 : 1;
    return a.naturalRank - b.naturalRank;
  });
  const displayOrder = ranked.map((entry) => entry.naturalRank);
  const visibleCount = displayOrder.length;

  const subtitle = collection.subtitle
    ? `${collection.subtitle}&nbsp; · &nbsp;${visibleCount} photographs`
    : `${visibleCount} photographs`;
  const photoMapping = `const displayOrder: number[] = [${displayOrder.join(", ")}];\n\nconst photographs = displayOrder.map((number) => ({\n  ...photographData[number - 1],\n  src: \`/galleries/${collection.slug}/${collection.slug}-\${String(number).padStart(2, "0")}.jpg\`,\n}));`;
  const otherCollections = collections
    .filter((other) => other.slug !== collection.slug)
    .map((other) => ({ slug: other.slug, title: other.title }));
  const page = `import { SiteHeader } from "../../SiteHeader";\nimport { Gallery } from "../Gallery";\n\ntype PhotographDataEntry = { filename: string; date: string | null; description: string; caption: string; altText: string; person: string[]; event: string[]; width: number; height: number };\n\nconst photographData: PhotographDataEntry[] = ${JSON.stringify(photographData, null, 2)};\n\n${photoMapping}\n\nconst otherCollections = ${JSON.stringify(otherCollections, null, 2)};\n\nexport default function ${collection.component}() {\n  return (\n    <main className="subpage collection-page">\n      <SiteHeader showHome />\n      <header className="collection-heading">\n        <a href="/collections">← Collections</a>\n        <h1>${collection.title}</h1>\n        <p>${subtitle}</p>\n      </header>\n      <Gallery\n        name=${quoted(collection.title)}\n        slug=${quoted(collection.slug)}\n        photographs={photographs}\n        otherCollections={otherCollections}\n        editable={process.env.NODE_ENV === "development"}\n      />\n    </main>\n  );\n}\n`;
  const collectionPageDirectory = path.join(root, "app", "collections", collection.slug);
  await mkdir(collectionPageDirectory, { recursive: true });
  await writeFile(path.join(collectionPageDirectory, "page.tsx"), page);
  console.log(
    `${collection.title}: ${visibleCount} photographs (${reusedCount} unchanged, ${processedCount} processed${hiddenCount ? `, ${hiddenCount} hidden` : ""})`,
  );

  const requestedCoverNumber = collection.coverPhoto ?? 1;
  const coverNumber = collectionOverrides[filenames[requestedCoverNumber - 1]]?.hidden
    ? (displayOrder[0] ?? requestedCoverNumber)
    : requestedCoverNumber;

  const collectionPeople = new Set();
  const collectionEvents = new Set();
  for (const naturalRank of displayOrder) {
    const photo = photographData[naturalRank - 1];
    for (const p of photo.person ?? []) collectionPeople.add(p);
    for (const e of photo.event ?? []) collectionEvents.add(e);
  }

  indexCards.push({
    slug: collection.slug,
    title: collection.title,
    person: [...collectionPeople].sort(),
    event: [...collectionEvents].sort(),
    count: visibleCount,
    coverBasename: `${collection.slug}-${String(coverNumber).padStart(2, "0")}.jpg`,
  });
}

const indexPage = `import { SiteHeader } from "../SiteHeader";
import { CollectionsIndex } from "./CollectionsIndex";

const cards = ${JSON.stringify(indexCards, null, 2)};

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Collections</h1>
        <CollectionsIndex cards={cards} />
      </section>
    </main>
  );
}
`;
await writeFile(path.join(root, "app", "collections", "page.tsx"), indexPage);
console.log("Collections index page regenerated.");

await rm(temporaryRoot, { recursive: true, force: true });
