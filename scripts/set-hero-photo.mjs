// Resizes a source photo (TIFF or JPEG) and installs it as the homepage
// hero image at public/lead-photo.jpg, replacing whatever was there.
//
// Run with: npm run hero:set -- "/path/to/source/photo.tif"

import sharp from "sharp";
import path from "node:path";
import { access, readFile, writeFile } from "node:fs/promises";

const root = process.cwd();
const destination = path.join(root, "public", "lead-photo.jpg");
const cssPath = path.join(root, "app", "globals.css");

const sourcePath = process.argv[2];

async function main() {
  if (!sourcePath) {
    console.error('Usage: npm run hero:set -- "/path/to/source/photo.tif"');
    process.exitCode = 1;
    return;
  }

  try {
    await access(sourcePath);
  } catch {
    console.error(`Couldn't find a file at: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  const image = sharp(sourcePath);
  const metadata = await image.metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);

  // The hero fills the full browser width at full viewport height, so it
  // needs to stay sharp on large, wide screens. 2600px on the long edge is
  // comfortably crisp without producing an unnecessarily huge file.
  const targetWidth = 2600;

  await image
    .rotate() // respects the photo's embedded orientation
    .resize({ width: targetWidth, withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(destination);

  const result = sharp(destination);
  const resultMetadata = await result.metadata();
  console.log(`Saved to public/lead-photo.jpg at ${resultMetadata.width}x${resultMetadata.height}`);

  // On wide screens the homepage sizes the photo to its own aspect ratio
  // (see the "min-width: 1400px" block in globals.css) instead of cropping
  // or letterboxing it, so that value has to track whatever photo is
  // actually installed here.
  const css = await readFile(cssPath, "utf8");
  const updatedCss = css.replace(
    /--hero-aspect:\s*[\d.]+\s*\/\s*[\d.]+;/,
    `--hero-aspect: ${resultMetadata.width} / ${resultMetadata.height};`,
  );
  if (updatedCss === css) {
    console.warn("\nCouldn't find --hero-aspect in app/globals.css to update -- update it by hand.");
  } else {
    await writeFile(cssPath, updatedCss);
    console.log(`Updated --hero-aspect to ${resultMetadata.width} / ${resultMetadata.height} in app/globals.css`);
  }

  console.log("\nRun `npm run dev` and check the homepage. If it looks right, run `npm run save` to publish it.");
}

main().catch((error) => {
  console.error("\nSomething went wrong:", error.message);
  process.exitCode = 1;
});
