// Shared by add-collection.mjs (manual) and sync-gallery.mjs (auto-discovery)
// so a collection's slug/component name are derived the same way regardless
// of which path created it.

export function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toComponentName(title, isTaken) {
  const words = title.match(/[a-zA-Z]+|[0-9]+/g) ?? ["Collection"];
  const base =
    words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("") + "Page";
  let candidate = base;
  let suffix = 2;
  while (isTaken(candidate)) {
    candidate = `${base.slice(0, -4)}${suffix}Page`;
    suffix += 1;
  }
  return candidate;
}
