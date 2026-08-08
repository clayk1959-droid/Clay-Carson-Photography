// Interactive helper: adds a brand-new collection by asking plain-English
// questions — no code editing required. It creates the "Gallery Originals"
// subfolder for you and adds the matching entry to scripts/sync-gallery.mjs.
//
// Run with: npm run collection:add

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const root = process.cwd();
const syncScriptPath = path.join(root, "scripts", "sync-gallery.mjs");
const galleryOriginalsRoot = path.join(root, "Gallery Originals");

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toComponentName(title, existingScript) {
  const words = title.match(/[a-zA-Z]+|[0-9]+/g) ?? ["Collection"];
  const base =
    words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("") + "Page";
  let candidate = base;
  let suffix = 2;
  while (existingScript.includes(`function ${candidate}(`) || existingScript.includes(`component: "${candidate}"`)) {
    candidate = `${base.slice(0, -4)}${suffix}Page`;
    suffix += 1;
  }
  return candidate;
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("Let's add a new photo collection. Just answer a few questions.\n");

  const title = (await rl.question('What should the collection be called? (e.g. "Beach 2026")\n> ')).trim();
  if (!title) {
    console.log("No name entered — cancelled.");
    rl.close();
    return;
  }

  const personInput = (
    await rl.question('\nWho is this collection of/from? Comma-separated names, e.g. "Christian, Katie". Leave blank to skip.\n> ')
  ).trim();
  const eventInput = (
    await rl.question('\nWhat event or occasion is this from? Comma-separated, e.g. "Reunion, Christmas". Leave blank to skip.\n> ')
  ).trim();
  const toList = (value) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  const person = toList(personInput);
  const event = toList(eventInput);

  const script = await readFile(syncScriptPath, "utf8");
  const slug = toSlug(title);
  const component = toComponentName(title, script);
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
    rl.close();
    return;
  }

  const newEntry = `  { folder: ${JSON.stringify(folder)}, slug: ${JSON.stringify(slug)}, title: ${JSON.stringify(title)}, component: ${JSON.stringify(component)}, person: ${JSON.stringify(person)}, event: ${JSON.stringify(event)}, subtitle: null },\n`;

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

  rl.close();
}

main().catch((error) => {
  console.error("\nSomething went wrong:", error.message);
  process.exitCode = 1;
});
