import { readdirSync } from "node:fs";
import path from "node:path";

// The homepage hero rotates through whatever photos are dropped into
// public/homepage/desktop and public/homepage/mobile -- no code change or
// manifest file needed to add, remove, or reorder one. Files are read in
// alphabetical order, so prefixing filenames with "01-", "02-", etc. is an
// easy way to control the rotation order.

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function listPhotos(variant: "desktop" | "mobile"): string[] {
  const dir = path.join(process.cwd(), "public", "homepage", variant);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => `/homepage/${variant}/${name}`);
}

export function getHomepagePhotos() {
  return {
    desktop: listPhotos("desktop"),
    mobile: listPhotos("mobile"),
  };
}
