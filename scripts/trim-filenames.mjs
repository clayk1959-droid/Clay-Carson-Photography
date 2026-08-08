// Strips everything from a given word onward in every filename in a folder,
// keeping the extension — then walks through each proposed rename one at a
// time so you can accept it, type a replacement, or skip it.
//
// Run with: npm run trim-filenames -- "Gallery Originals/Some Folder" "copy"

import { access, readdir, rename } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const [, , folderArg, wordArg] = process.argv;

if (!folderArg || !wordArg) {
  console.error('Usage: npm run trim-filenames -- "Gallery Originals/Some Folder" "word"');
  console.error('Strips everything from "word" onward in each filename, keeping the extension.');
  process.exitCode = 1;
  process.exit();
}

const folder = path.resolve(folderArg);
const escapedWord = wordArg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = new RegExp(`\\s*\\b${escapedWord}\\b.*$`, "i");

const entries = await readdir(folder);
const proposals = [];

for (const filename of entries) {
  if (filename.startsWith(".")) continue;
  const ext = path.extname(filename);
  const base = filename.slice(0, filename.length - ext.length);
  const trimmedBase = base.replace(pattern, "").trimEnd();

  if (trimmedBase && trimmedBase !== base) {
    proposals.push({ from: filename, to: `${trimmedBase}${ext}` });
  }
}

if (proposals.length === 0) {
  console.log(`No filenames in "${folder}" contain "${wordArg}".`);
  process.exit();
}

console.log(`Found ${proposals.length} file(s) to rename in "${folder}".`);
console.log('For each one: press Enter to accept, type a replacement filename, or type "skip".\n');

const rl = readline.createInterface({ input: stdin, output: stdout });
const decisions = [];

for (const { from, to } of proposals) {
  console.log(`  ${from}`);
  const answer = (await rl.question(`  → ${to}   (Enter to accept / type new name / "skip") \n  > `)).trim();
  console.log("");

  if (answer.toLowerCase() === "skip") continue;
  decisions.push({ from, to: answer.length > 0 ? answer : to });
}

rl.close();

if (decisions.length === 0) {
  console.log("Nothing to rename — no files were changed.");
  process.exit();
}

console.log(`Renaming ${decisions.length} file(s):\n`);
for (const { from, to } of decisions) {
  const toPath = path.join(folder, to);
  const alreadyExists = await access(toPath).then(() => true).catch(() => false);
  if (alreadyExists) {
    console.warn(`  Skipped "${from}" — "${to}" already exists.`);
    continue;
  }
  await rename(path.join(folder, from), toPath);
  console.log(`  Renamed: ${from} → ${to}`);
}

console.log("\nDone.");
