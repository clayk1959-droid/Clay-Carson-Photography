// Interactive helper: adds a brand-new collection by asking for its name —
// no code editing required. It creates the "Gallery Originals" subfolder
// for you and adds the matching entry to scripts/sync-gallery.mjs.
//
// Run with: npm run collection:add
//
// You don't actually need this script to add a collection — dropping a new,
// non-empty folder into "Gallery Originals" and running `npm run gallery:sync`
// registers it automatically, using the folder name as the title. This
// script is just a shortcut for creating the folder and the entry in one
// step before you've copied any photos in yet.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { toSlug, toComponentName } from "./lib/naming.mjs";

const root = process.cwd();
const syncScriptPath = path.join(root, "scripts", "sync-gallery.mjs");
const galleryOriginalsRoot = path.join(root, "Gallery Originals");

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("Let's add a new photo collection.\n");

  const title = (await rl.question('What should the collection be called? (e.g. "Beach 2026")\n> ')).trim();
  rl.close();

  if (!title) {
    console.log("No name entered — cancelled.");
    return;
  }

  const script = await readFile(syncScriptPath, "utf8");
  const slug = toSlug(title);
  const component = toComponentName(title, (candidate) => script.includes(`"${candidate}"`));
  const folder = title; // Folder name inside "Gallery Originals" matches the title exactly.

  // Find the collections array's own closing "];" (on its own line) rather
  // than anchoring to whatever code happens to follow it — that adjacency
  // has broken before when other code got added right after the array.
  const marker = "const collections = [";
  const markerIndex = script.indexOf(marker);
  const bracketIndex = markerIndex === -1 ? -1 : script.indexOf("\n];", markerIndex);
  const insertPoint = bracketIndex === -1 ? -1 : bracketIndex + 1;
  if (markerIndex === -1 || insertPoint === -1) {
    console.error("Couldn't find the expected spot in scripts/sync-gallery.mjs — it may have been edited. Ask Claude to add the collection manually instead.");
    return;
  }

  const newEntry = `  { folder: ${JSON.stringify(folder)}, slug: ${JSON.stringify(slug)}, title: ${JSON.stringify(title)}, component: ${JSON.stringify(component)}, subtitle: null },\n`;

  const updatedScript = script.slice(0, insertPoint) + newEntry + script.slice(insertPoint);
  await writeFile(syncScriptPath, updatedScript);

  const newFolderPath = path.join(galleryOriginalsRoot, folder);
  await mkdir(newFolderPath, { recursive: true });

  console.log(`\nDone. A folder was created at:\n  Gallery Originals/${folder}\n`);
  console.log("Next steps:");
  console.log(`  1. Copy your photos into that folder.`);
  console.log(`  2. Run: npm run gallery:sync`);
  console.log(`  3. Run: npm run dev, and check it at localhost:3000/collections/${slug}`);
  console.log(`  4. Run: npm run save`);
}

main().catch((error) => {
  console.error("\nSomething went wrong:", error.message);
  process.exitCode = 1;
});
