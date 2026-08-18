// Interactive helper: sets which photo is used as a collection's cover art
// on the Collections page — no code editing required.
//
// Run with: npm run collection:cover

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const syncScriptPath = path.join(root, "scripts", "sync-gallery.mjs");
const manifestPath = path.join(root, ".cache", "gallery-sync", "collections.json");

async function main() {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    console.error("Couldn't find the collections list — run `npm run gallery:sync` first, then try this again.");
    return;
  }

  if (manifest.length === 0) {
    console.log("There aren't any collections yet.");
    return;
  }

  console.log("Which collection do you want to set a cover photo for?\n");
  manifest.forEach((collection, index) => console.log(`  ${index + 1}. ${collection.title}`));

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const choice = await rl.question("\nType a number: ");
  const collection = manifest[Number(choice) - 1];
  if (!collection) {
    console.log("Not a valid choice — cancelled.");
    rl.close();
    return;
  }

  const thumbDir = path.join(root, "public", "gallery-thumbnails", collection.slug);
  console.log(`\nOpening "${collection.title}"'s photos in Finder so you can find the one you want...`);
  await run("open", [thumbDir]).catch(() => {});
  console.log(
    `Each photo is named "${collection.slug}-01.jpg", "${collection.slug}-02.jpg", and so on — the\nnumber in the name is the one to use. (These also match the numbered badges\nshown at localhost:3000/collections/${collection.slug}.)`,
  );

  const numberAnswer = await rl.question("\nWhich photo number should be the cover? (e.g. 7)\n> ");
  rl.close();

  const number = Number(numberAnswer);
  if (!Number.isInteger(number) || number < 1) {
    console.log("That doesn't look like a valid photo number — cancelled.");
    return;
  }

  const scriptText = await readFile(syncScriptPath, "utf8");
  const needle = `folder: ${JSON.stringify(collection.folder)}`;
  const needleIndex = scriptText.indexOf(needle);

  // Find this collection's entry the same way sync-gallery.mjs finds
  // entries to add/remove: search backward/forward for the surrounding
  // "  {" / "},\n" rather than assuming single-line or multi-line
  // formatting, so this works no matter how the entry was written.
  const entryStartMarker = needleIndex === -1 ? -1 : scriptText.lastIndexOf("\n  {", needleIndex);
  const closeIndex = needleIndex === -1 ? -1 : scriptText.indexOf("},\n", needleIndex);
  if (needleIndex === -1 || entryStartMarker === -1 || closeIndex === -1) {
    console.error(
      `Couldn't find "${collection.title}" in scripts/sync-gallery.mjs — it may have been edited. Ask Claude to set this manually instead.`,
    );
    return;
  }
  const entryStart = entryStartMarker + 1;
  const entryEnd = closeIndex + "},\n".length;
  const entryText = scriptText.slice(entryStart, entryEnd);

  const field = (name) => entryText.match(new RegExp(`${name}:\\s*("(?:[^"\\\\]|\\\\.)*"|null)`))?.[1];
  const folder = field("folder");
  const slug = field("slug");
  const title = field("title");
  const component = field("component");
  const subtitle = field("subtitle") ?? "null";

  const newEntry = `  { folder: ${folder}, slug: ${slug}, title: ${title}, component: ${component}, subtitle: ${subtitle}, coverPhoto: ${number} },\n`;
  const updatedScript = scriptText.slice(0, entryStart) + newEntry + scriptText.slice(entryEnd);
  await writeFile(syncScriptPath, updatedScript);

  console.log(`\nDone. "${collection.title}"'s cover photo is now set to #${String(number).padStart(2, "0")}.`);
  console.log("Next steps:");
  console.log("  1. Run: npm run gallery:sync");
  console.log(`  2. Check it locally, then run: npm run save`);
}

main().catch((error) => {
  console.error("\nSomething went wrong:", error.message);
  process.exitCode = 1;
});
