// Interactive helper: sets which photo is used as a collection's cover art
// on the Collections page, and how it's cropped — no code editing required.
// (You can also do this from the pencil-icon editor on any photo, in
// `npm run dev` — this is the terminal alternative.)
//
// Run with: npm run collection:cover

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const manifestPath = path.join(root, ".cache", "gallery-sync", "collections.json");
const overridesPath = path.join(root, "data", "collection-overrides.json");
const galleryOriginalsRoot = path.join(root, "Gallery Originals");

const POSITIONS = [
  ["1", "left top"],
  ["2", "center top"],
  ["3", "right top"],
  ["4", "left center"],
  ["5", "center center (default)"],
  ["6", "right center"],
  ["7", "left bottom"],
  ["8", "center bottom"],
  ["9", "right bottom"],
];

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

  const originalsDir = path.join(galleryOriginalsRoot, collection.folder);
  const filenames = (await readdir(originalsDir)).filter((f) => !f.startsWith("."));

  if (filenames.length === 0) {
    console.log(`Couldn't find any photos in "${collection.folder}" — cancelled.`);
    rl.close();
    return;
  }

  console.log(`\nOpening "${collection.title}"'s photos in Finder so you can find the one you want...`);
  await run("open", [originalsDir]).catch(() => {});

  console.log("\nWhich photo? Type its filename exactly as shown in Finder (e.g. IMG_1234.jpg):");
  const filenameAnswer = (await rl.question("> ")).trim();
  const filename = filenames.find((f) => f.toLowerCase() === filenameAnswer.toLowerCase());
  if (!filename) {
    console.log(`Couldn't find "${filenameAnswer}" in that folder — cancelled.`);
    rl.close();
    return;
  }

  console.log("\nHow should it be cropped to fit the cover box? Type a number:\n");
  POSITIONS.forEach(([key, label]) => console.log(`  ${key}. ${label}`));
  const positionAnswer = await rl.question("\n> ");
  rl.close();

  const chosen = POSITIONS.find(([key]) => key === positionAnswer.trim());
  const position = chosen ? chosen[1].replace(" (default)", "") : "center center";

  let overrides = {};
  try {
    overrides = JSON.parse(await readFile(overridesPath, "utf8"));
  } catch {
    overrides = {};
  }
  overrides[collection.slug] = { coverPhoto: filename, coverPosition: position };

  await mkdir(path.dirname(overridesPath), { recursive: true });
  await writeFile(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");

  console.log(`\nDone. "${collection.title}"'s cover photo is now "${filename}", cropped from ${position}.`);
  console.log("Next steps:");
  console.log("  1. Run: npm run gallery:sync");
  console.log(`  2. Check it locally, then run: npm run save`);
}

main().catch((error) => {
  console.error("\nSomething went wrong:", error.message);
  process.exitCode = 1;
});
