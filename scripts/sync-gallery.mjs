import { access, copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

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

// To add a brand-new collection: drop a folder of photos into
// "Gallery Originals" (name it whatever you like), then add one entry below.
// Everything else — the gallery page, the Collections index card, thumbnails,
// and full-size images — is generated automatically on the next sync.
//   folder:     exact folder name inside "Gallery Originals"
//   slug:       URL-safe id, e.g. "norway" -> /collections/norway
//   title:      heading shown on the gallery page and index card
//   component:  a unique PascalCase React component name
//   category:   short label shown on the Collections index card (e.g. "Travel", "Personal")
//   subtitle:   optional extra text on the gallery page itself (e.g. a date)
//   coverPhoto: optional 1-based photo number to use as the index card thumbnail (defaults to 1)
// Per-photo caption/date/order corrections live in data/gallery-overrides.json
// (edit via the pencil icon shown on each photo when running `npm run dev`,
// or by hand) — they're applied on top of the auto-detected data below and
// survive future syncs.
const collections = [
  { folder: "Christian", slug: "christian", title: "Christian", component: "ChristianPage", category: "Personal", subtitle: null },
  {
    folder: "Gulf Shores 2025",
    slug: "gulf-shores-2025",
    title: "Gulf Shores 2025",
    component: "GulfShoresPage",
    category: "September 2025",
    subtitle: "September 2025",
    coverPhoto: 14,
  },
  { folder: "Norway", slug: "norway", title: "Norway", component: "NorwayPage", category: "Travel", subtitle: null, coverPhoto: 13 },
];

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
  return { date, description };
}

const indexCards = [];

for (const collection of collections) {
  const sourceDirectory = path.join(sourceRoot, collection.folder);
  const filenames = (await readdir(sourceDirectory))
    .filter((filename) => !filename.startsWith("."))
    .sort();

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

  for (const [index, filename] of filenames.entries()) {
    const number = String(index + 1).padStart(2, "0");
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
    metadataCache[filename] = { mtimeMs: metadataSourceMtimeMs, date: auto.date, description: auto.description };

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

  const ranked = photographData.map((photograph, index) => {
    const naturalRank = index + 1;
    const overrideOrder = collectionOverrides[photograph.filename]?.order;
    return { naturalRank, sortRank: overrideOrder ?? naturalRank, hasOverride: overrideOrder !== undefined };
  });
  ranked.sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
    // A photo explicitly moved to this position wins a tie against a photo
    // that merely landed here by natural (filename) order.
    if (a.hasOverride !== b.hasOverride) return a.hasOverride ? -1 : 1;
    return a.naturalRank - b.naturalRank;
  });
  const displayOrder = ranked.map((entry) => entry.naturalRank);

  const subtitle = collection.subtitle
    ? `${collection.subtitle}&nbsp; · &nbsp;${filenames.length} photographs`
    : `${filenames.length} photographs`;
  const photoMapping = `const displayOrder = [${displayOrder.join(", ")}];\n\nconst photographs = displayOrder.map((number) => ({\n  ...photographData[number - 1],\n  src: \`/galleries/${collection.slug}/${collection.slug}-\${String(number).padStart(2, "0")}.jpg\`,\n}));`;
  const page = `import { SiteHeader } from "../../SiteHeader";\nimport { Gallery } from "../Gallery";\n\nconst photographData = ${JSON.stringify(photographData, null, 2)};\n\n${photoMapping}\n\nexport default function ${collection.component}() {\n  return (\n    <main className="subpage collection-page">\n      <SiteHeader showHome />\n      <header className="collection-heading">\n        <a href="/collections">← Collections</a>\n        <h1>${collection.title}</h1>\n        <p>${subtitle}</p>\n      </header>\n      <Gallery\n        name=${quoted(collection.title)}\n        slug=${quoted(collection.slug)}\n        photographs={photographs}\n        editable={process.env.NODE_ENV === "development"}\n      />\n    </main>\n  );\n}\n`;
  const collectionPageDirectory = path.join(root, "app", "collections", collection.slug);
  await mkdir(collectionPageDirectory, { recursive: true });
  await writeFile(path.join(collectionPageDirectory, "page.tsx"), page);
  console.log(
    `${collection.title}: ${filenames.length} photographs (${reusedCount} unchanged, ${processedCount} processed)`,
  );

  indexCards.push({
    slug: collection.slug,
    title: collection.title,
    category: collection.category ?? "",
    count: filenames.length,
    coverBasename: `${collection.slug}-${String(collection.coverPhoto ?? 1).padStart(2, "0")}.jpg`,
  });
}

const indexPage = `import { SiteHeader } from "../SiteHeader";

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Collections</h1>

        <div className="collection-index">
${indexCards
  .map(
    (card) => `          <a className="collection-card" href="/collections/${card.slug}">
            <div className="collection-cover">
              <img
                src="/gallery-thumbnails/${card.slug}/${card.coverBasename}"
                alt=${quoted(`${card.title} collection`)}
              />
            </div>
            <div className="collection-details">
              <div>
                <p className="collection-date">${card.category}</p>
                <h2>${card.title}</h2>
              </div>
              <p className="collection-count">${card.count} photographs</p>
              <span className="collection-link">View collection&nbsp; →</span>
            </div>
          </a>`,
  )
  .join("\n\n")}
        </div>
      </section>
    </main>
  );
}
`;
await writeFile(path.join(root, "app", "collections", "page.tsx"), indexPage);
console.log("Collections index page regenerated.");

await rm(temporaryRoot, { recursive: true, force: true });
