import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
//   displayOrder: optional array to control custom photo ordering (defaults to filename order)
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
    displayOrder: [4, 9, 6, 3, 2, 7, 8, 10, 11, 12, 13, 5, 14, 15, 16, 17, 1],
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

async function readMetadata(source, fallback) {
  const { stdout } = await run("sips", ["-g", "creation", "-g", "description", source]);
  const creation = stdout.match(/^\s*creation:\s*(.+)$/m)?.[1]?.trim();
  const contents = (await readFile(source)).toString("utf8");
  const altText = contents.match(
    /<Iptc4xmpCore:AltTextAccessibility>[\s\S]*?<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>[\s\S]*?<\/Iptc4xmpCore:AltTextAccessibility>/,
  )?.[1]?.trim();
  const description = altText ? decodeXml(altText) : humanizeFilename(fallback);
  if (!creation) return { caption: description, altText: description };

  const match = creation.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return { caption: `${creation} — ${description}`, altText: description };
  const [, year, month, day, hour, minute, second] = match;
  const timestamp = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return { caption: `${timestamp} — ${description}`, altText: description };
}

const indexCards = [];

for (const collection of collections) {
  const sourceDirectory = path.join(sourceRoot, collection.folder);
  const filenames = (await readdir(sourceDirectory))
    .filter((filename) => !filename.startsWith("."))
    .sort();

  const fullDirectory = path.join(root, "public", "galleries", collection.slug);
  const thumbnailDirectory = path.join(root, "public", "gallery-thumbnails", collection.slug);
  await rm(fullDirectory, { recursive: true, force: true });
  await rm(thumbnailDirectory, { recursive: true, force: true });
  await mkdir(fullDirectory, { recursive: true });
  await mkdir(thumbnailDirectory, { recursive: true });
  const photographData = [];

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
    const isTiff = /\.tiff?$/i.test(filename);
    const workingSource = isTiff
      ? path.join(temporaryRoot, `${collection.slug}-${number}.jpg`)
      : source;
    if (isTiff) {
      await run("sips", ["-s", "format", "jpeg", source, "--out", workingSource]);
    }
    const basename = `${collection.slug}-${number}.jpg`;
    const metadata = await readMetadata(metadataSource, filename);
    const fullPath = path.join(fullDirectory, basename);
    await sharp(workingSource, { unlimited: true })
      .rotate()
      .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(fullPath);
    await sharp(workingSource, { unlimited: true })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(thumbnailDirectory, basename));
    const outputMetadata = await sharp(fullPath).metadata();
    photographData.push({
      ...metadata,
      width: outputMetadata.width,
      height: outputMetadata.height,
    });
  }

  const subtitle = collection.subtitle
    ? `${collection.subtitle}&nbsp; · &nbsp;${filenames.length} photographs`
    : `${filenames.length} photographs`;
  const orderDeclaration = collection.displayOrder
    ? `const displayOrder = [${collection.displayOrder.join(", ")}];\n\n`
    : "";
  const photoMapping = collection.displayOrder
    ? `const photographs = displayOrder.map((number) => ({\n  ...photographData[number - 1],\n  src: \`/galleries/${collection.slug}/${collection.slug}-\${String(number).padStart(2, "0")}.jpg\`,\n}));`
    : `const photographs = photographData.map((photograph, index) => ({\n  ...photograph,\n  src: \`/galleries/${collection.slug}/${collection.slug}-\${String(index + 1).padStart(2, "0")}.jpg\`,\n}));`;
  const page = `import { SiteHeader } from "../../SiteHeader";\nimport { Gallery } from "../Gallery";\n\n${orderDeclaration}const photographData = ${JSON.stringify(photographData, null, 2)};\n\n${photoMapping}\n\nexport default function ${collection.component}() {\n  return (\n    <main className="subpage collection-page">\n      <SiteHeader showHome />\n      <header className="collection-heading">\n        <a href="/collections">← Collections</a>\n        <h1>${collection.title}</h1>\n        <p>${subtitle}</p>\n      </header>\n      <Gallery name=${quoted(collection.title)} photographs={photographs} />\n    </main>\n  );\n}\n`;
  const collectionPageDirectory = path.join(root, "app", "collections", collection.slug);
  await mkdir(collectionPageDirectory, { recursive: true });
  await writeFile(path.join(collectionPageDirectory, "page.tsx"), page);
  console.log(`${collection.title}: ${filenames.length} photographs`);

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
