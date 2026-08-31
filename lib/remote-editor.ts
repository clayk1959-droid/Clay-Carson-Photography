// Shared plumbing for the three edit routes' remote-mode branch
// (gallery-overrides, gallery-cover, gallery-reorder): fetch the current
// state of every relevant file fresh from GitHub, let the caller mutate
// the specific override(s), recompute displayOrder and the Collections-
// index card/photos entries using the exact same functions
// scripts/sync-gallery.mjs uses locally, and commit every file in one
// atomic commit. This is the remote equivalent of editing a local JSON
// file and then clicking "Sync Gallery".
import { getFileContent, commitFiles, type CommitFile } from "./github-commit";
// Plain JS module, shared with scripts/sync-gallery.mjs so remote edits can
// never compute a different result than a local sync.
import {
  computeDisplayOrder,
  computeIndexCard,
  computeIndexPhotos,
  sortIndexCards,
} from "../scripts/lib/photo-ranking.mjs";
import { formatDate } from "../scripts/lib/format-date.mjs";

export type PhotoOverride = {
  caption?: string;
  date?: string;
  order?: number;
  hidden?: boolean;
  person?: string[];
  event?: string[];
};
export type Overrides = Record<string, Record<string, PhotoOverride>>;
export type CollectionOverrides = Record<string, PhotoOverride>;
export type CoverOverride = {
  coverPhoto?: string;
  coverPosition?: string;
  firstSyncedAt?: string;
  pinnedAt?: string;
  private?: boolean;
};
export type CoverOverrides = Record<string, CoverOverride>;
export type PhotographDataEntry = {
  filename: string;
  date: string | null;
  description: string;
  caption: string;
  altText: string;
  person: string[];
  event: string[];
  width: number;
  height: number;
  hidden?: boolean;
};
export type PhotoData = { photographData: PhotographDataEntry[]; displayOrder: number[] };

// One staged, not-yet-committed editor action. Each variant maps 1:1 to a
// single distinct action a person can take in the editor UI (pin, make
// private, set cover, reorder, edit a photo's fields, hide/unhide) --
// deliberately split by *what changed*, not by which API route used to
// handle it, so two different staged actions on the same photo (e.g. a
// caption edit, then later hiding it) never clobber each other while
// queued. `pinned`/`private` carry the *target* state rather than "toggle",
// so staging the same action twice before syncing (pin, then unpin) nets
// out correctly instead of double-toggling. `key` is how the client
// deduplicates repeated edits to the same target, keeping only the latest;
// `label` is a human-readable summary for the pending-changes list.
export type PendingEdit =
  | { key: string; type: "pin"; slug: string; pinned: boolean; label: string }
  | { key: string; type: "privacy"; slug: string; private: boolean; label: string }
  | { key: string; type: "cover"; slug: string; filename: string; position: string; label: string }
  | { key: string; type: "reorder"; slug: string; filenames: string[]; label: string }
  | {
      key: string;
      type: "photoFields";
      slug: string;
      filename: string;
      label: string;
      caption: string;
      date: string | null;
      order: number;
      person: string[];
      event: string[];
    }
  | { key: string; type: "photoHidden"; slug: string; filename: string; label: string; hidden: boolean };

const OVERRIDES_PATH = "data/gallery-overrides.json";
const COVER_OVERRIDES_PATH = "data/collection-overrides.json";
const COLLECTIONS_PATH = "data/photo-data/_collections.json";
const INDEX_PATH = "data/photo-data/_index.json";
const photoDataPath = (slug: string) => `data/photo-data/${slug}.json`;

async function readJson<T>(path: string, fallback: T): Promise<T> {
  const content = await getFileContent(path);
  if (content === null) return fallback;
  return JSON.parse(content) as T;
}

function sortedEntries<T>(object: Record<string, T>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of Object.keys(object).sort()) {
    result[key] = object[key];
  }
  return result;
}

export async function getCollectionTitle(slug: string): Promise<string | null> {
  const collections = await readJson<{ slug: string; title: string }[]>(COLLECTIONS_PATH, []);
  return collections.find((collection) => collection.slug === slug)?.title ?? null;
}

type MutationContext = {
  overrides: Overrides;
  collectionOverrides: CollectionOverrides;
  photoData: PhotoData;
  coverOverrides: CoverOverrides;
};

export async function applyRemoteEdit(
  slug: string,
  mutate: (context: MutationContext) => void,
  commitMessage: string,
): Promise<void> {
  const title = await getCollectionTitle(slug);
  if (!title) throw new Error("Unknown collection");

  const overrides = await readJson<Overrides>(OVERRIDES_PATH, {});
  const coverOverrides = await readJson<CoverOverrides>(COVER_OVERRIDES_PATH, {});
  const photoData = await readJson<PhotoData>(photoDataPath(slug), { photographData: [], displayOrder: [] });
  const indexData = await readJson<{ cards: unknown[]; photos: unknown[] }>(INDEX_PATH, { cards: [], photos: [] });

  if (!overrides[slug]) overrides[slug] = {};
  const collectionOverrides = overrides[slug];

  mutate({ overrides, collectionOverrides, photoData, coverOverrides });

  // Drop an emptied-out collection override object, matching the local
  // route's behavior.
  if (Object.keys(overrides[slug]).length === 0) delete overrides[slug];

  photoData.displayOrder = computeDisplayOrder(photoData.photographData, collectionOverrides);
  const coverOverride = coverOverrides[slug] ?? {};
  const newCard = computeIndexCard({
    slug,
    title,
    photographData: photoData.photographData,
    collectionOverrides,
    displayOrder: photoData.displayOrder,
    coverOverride,
  });
  const newPhotosForCollection = computeIndexPhotos({
    slug,
    title,
    photographData: photoData.photographData,
    displayOrder: photoData.displayOrder,
  });

  indexData.cards = (indexData.cards as { slug: string }[]).map((card) => (card.slug === slug ? newCard : card));
  indexData.photos = [
    ...(indexData.photos as { collectionSlug: string }[]).filter((photo) => photo.collectionSlug !== slug),
    ...newPhotosForCollection,
  ];

  const sortedOverrides: Overrides = {};
  for (const key of Object.keys(overrides).sort()) {
    sortedOverrides[key] = sortedEntries(overrides[key]);
  }

  await commitFiles(
    [
      { path: OVERRIDES_PATH, content: `${JSON.stringify(sortedOverrides, null, 2)}\n` },
      { path: COVER_OVERRIDES_PATH, content: `${JSON.stringify(sortedEntries(coverOverrides), null, 2)}\n` },
      { path: photoDataPath(slug), content: `${JSON.stringify(photoData, null, 2)}\n` },
      { path: INDEX_PATH, content: `${JSON.stringify(indexData, null, 2)}\n` },
    ],
    commitMessage,
  );
}

// Toggles a collection's "nudge to top" pin. Unlike applyRemoteEdit above,
// this doesn't touch a single card's contents -- it changes where every
// card sits relative to each other, so the whole cards array gets
// re-sorted with the same function the local sync script uses, rather than
// patched in place.
export async function applyPinRemote(slug: string, editorName: string | null): Promise<{ pinned: boolean }> {
  const title = await getCollectionTitle(slug);
  if (!title) throw new Error("Unknown collection");

  const coverOverrides = await readJson<CoverOverrides>(COVER_OVERRIDES_PATH, {});
  const indexData = await readJson<{ cards: { slug: string }[]; photos: unknown[] }>(INDEX_PATH, {
    cards: [],
    photos: [],
  });

  const existing = coverOverrides[slug] ?? {};
  const nowPinned = !existing.pinnedAt;
  coverOverrides[slug] = nowPinned
    ? { ...existing, pinnedAt: new Date().toISOString() }
    : { ...existing, pinnedAt: undefined };
  if (!nowPinned) delete coverOverrides[slug].pinnedAt;

  indexData.cards = sortIndexCards(indexData.cards, coverOverrides);

  await commitFiles(
    [
      { path: COVER_OVERRIDES_PATH, content: `${JSON.stringify(sortedEntries(coverOverrides), null, 2)}\n` },
      { path: INDEX_PATH, content: `${JSON.stringify(indexData, null, 2)}\n` },
    ],
    `Editor${editorName ? ` (${editorName})` : ""}: ${nowPinned ? `pin ${slug} to top` : `unpin ${slug}`}`,
  );

  return { pinned: nowPinned };
}

// Toggles a collection's private flag. Unlike pin, this doesn't change
// where the card sits or how it looks in the Galleries list (visible,
// no lock icon, by explicit design) -- it only changes whether the sync
// script routes that collection's images to non-public storage and
// whether its page requires a session. Just one file to commit.
export async function applyPrivacyRemote(slug: string, editorName: string | null): Promise<{ private: boolean }> {
  const title = await getCollectionTitle(slug);
  if (!title) throw new Error("Unknown collection");

  const coverOverrides = await readJson<CoverOverrides>(COVER_OVERRIDES_PATH, {});

  const existing = coverOverrides[slug] ?? {};
  const nowPrivate = !existing.private;
  if (nowPrivate) {
    coverOverrides[slug] = { ...existing, private: true };
  } else {
    const { private: _private, ...rest } = existing;
    coverOverrides[slug] = rest;
  }

  await commitFiles(
    [{ path: COVER_OVERRIDES_PATH, content: `${JSON.stringify(sortedEntries(coverOverrides), null, 2)}\n` }],
    `Editor${editorName ? ` (${editorName})` : ""}: ${nowPrivate ? `mark ${slug} private` : `mark ${slug} public`}`,
  );

  return { private: nowPrivate };
}

// Applies a whole batch of staged editor actions -- possibly spanning
// several galleries -- as ONE read-mutate-write cycle and ONE commit. This
// is the fix for the race condition the three functions above have: each of
// them independently reads-then-writes the shared override files, so two
// edits fired close together can silently clobber each other (the second
// commit lands built from a snapshot that never saw the first one's
// change). Routing every remote edit through a single staged batch instead
// of committing per-click removes the race entirely, since there's only
// ever one read and one write per sync, no matter how many actions were
// staged in between.
export async function applyBatchRemote(edits: PendingEdit[], editorName: string | null): Promise<void> {
  if (edits.length === 0) return;

  const collections = await readJson<{ slug: string; title: string }[]>(COLLECTIONS_PATH, []);
  const titleBySlug = new Map(collections.map((collection) => [collection.slug, collection.title]));
  for (const edit of edits) {
    if (!titleBySlug.has(edit.slug)) throw new Error(`Unknown collection: ${edit.slug}`);
  }

  const overrides = await readJson<Overrides>(OVERRIDES_PATH, {});
  const coverOverrides = await readJson<CoverOverrides>(COVER_OVERRIDES_PATH, {});
  const indexData = await readJson<{ cards: { slug: string }[]; photos: { collectionSlug: string }[] }>(
    INDEX_PATH,
    { cards: [], photos: [] },
  );

  const touchedSlugs = new Set(edits.map((edit) => edit.slug));
  const photoDataBySlug = new Map<string, PhotoData>();
  for (const slug of touchedSlugs) {
    photoDataBySlug.set(slug, await readJson<PhotoData>(photoDataPath(slug), { photographData: [], displayOrder: [] }));
  }

  for (const edit of edits) {
    if (!overrides[edit.slug]) overrides[edit.slug] = {};
    const collectionOverrides = overrides[edit.slug];
    const photoData = photoDataBySlug.get(edit.slug)!;

    switch (edit.type) {
      case "pin": {
        const existing = coverOverrides[edit.slug] ?? {};
        coverOverrides[edit.slug] = edit.pinned
          ? { ...existing, pinnedAt: new Date().toISOString() }
          : { ...existing, pinnedAt: undefined };
        if (!edit.pinned) delete coverOverrides[edit.slug].pinnedAt;
        break;
      }
      case "privacy": {
        const existing = coverOverrides[edit.slug] ?? {};
        if (edit.private) {
          coverOverrides[edit.slug] = { ...existing, private: true };
        } else {
          const { private: _private, ...rest } = existing;
          coverOverrides[edit.slug] = rest;
        }
        break;
      }
      case "cover": {
        coverOverrides[edit.slug] = {
          ...(coverOverrides[edit.slug] ?? {}),
          coverPhoto: edit.filename,
          coverPosition: edit.position,
        };
        break;
      }
      case "reorder": {
        edit.filenames.forEach((filename, index) => {
          const existing = collectionOverrides[filename] ?? {};
          collectionOverrides[filename] = { ...existing, order: index + 1 };
        });
        break;
      }
      case "photoHidden": {
        const photoIndex = photoData.photographData.findIndex((photo) => photo.filename === edit.filename);
        if (photoIndex === -1) throw new Error(`Unknown photo: ${edit.filename} in ${edit.slug}`);

        if (edit.hidden) {
          const existing = collectionOverrides[edit.filename] ?? {};
          collectionOverrides[edit.filename] = { ...existing, hidden: true };
          photoData.photographData[photoIndex] = { ...photoData.photographData[photoIndex], hidden: true };
        } else {
          const existing = collectionOverrides[edit.filename] ?? {};
          const { hidden: _hiddenFlag, ...rest } = existing;
          if (Object.keys(rest).length === 0) delete collectionOverrides[edit.filename];
          else collectionOverrides[edit.filename] = rest;
          const { hidden: _photoHidden, ...restPhoto } = photoData.photographData[photoIndex];
          photoData.photographData[photoIndex] = restPhoto;
        }
        break;
      }
      case "photoFields": {
        const photoIndex = photoData.photographData.findIndex((photo) => photo.filename === edit.filename);
        if (photoIndex === -1) throw new Error(`Unknown photo: ${edit.filename} in ${edit.slug}`);

        const entry: PhotoOverride = { caption: edit.caption, order: edit.order, person: edit.person, event: edit.event };
        if (edit.date !== null) entry.date = edit.date;
        collectionOverrides[edit.filename] = { ...collectionOverrides[edit.filename], ...entry };

        const photo = photoData.photographData[photoIndex];
        photo.description = edit.caption;
        photo.altText = edit.caption;
        if (edit.date !== null) photo.date = edit.date;
        photo.person = edit.person;
        photo.event = edit.event;
        photo.caption = photo.date ? `${formatDate(photo.date)} — ${photo.description}` : photo.description;
        break;
      }
    }
  }

  for (const slug of touchedSlugs) {
    if (overrides[slug] && Object.keys(overrides[slug]).length === 0) delete overrides[slug];

    const photoData = photoDataBySlug.get(slug)!;
    const collectionOverrides = overrides[slug] ?? {};
    photoData.displayOrder = computeDisplayOrder(photoData.photographData, collectionOverrides);

    const title = titleBySlug.get(slug)!;
    const coverOverride = coverOverrides[slug] ?? {};
    const newCard = computeIndexCard({
      slug,
      title,
      photographData: photoData.photographData,
      collectionOverrides,
      displayOrder: photoData.displayOrder,
      coverOverride,
    });
    const newPhotosForCollection = computeIndexPhotos({
      slug,
      title,
      photographData: photoData.photographData,
      displayOrder: photoData.displayOrder,
    });

    indexData.cards = indexData.cards.map((card) => (card.slug === slug ? newCard : card));
    indexData.photos = [
      ...indexData.photos.filter((photo) => photo.collectionSlug !== slug),
      ...newPhotosForCollection,
    ];
  }

  // Re-sort every time, not just when a pin changed -- harmless no-op when
  // nothing pin-related was touched, and simpler than tracking that.
  indexData.cards = sortIndexCards(indexData.cards, coverOverrides);

  const sortedOverrides: Overrides = {};
  for (const key of Object.keys(overrides).sort()) {
    sortedOverrides[key] = sortedEntries(overrides[key]);
  }

  const files: CommitFile[] = [
    { path: OVERRIDES_PATH, content: `${JSON.stringify(sortedOverrides, null, 2)}\n` },
    { path: COVER_OVERRIDES_PATH, content: `${JSON.stringify(sortedEntries(coverOverrides), null, 2)}\n` },
    { path: INDEX_PATH, content: `${JSON.stringify(indexData, null, 2)}\n` },
  ];
  for (const slug of touchedSlugs) {
    files.push({ path: photoDataPath(slug), content: `${JSON.stringify(photoDataBySlug.get(slug), null, 2)}\n` });
  }

  const summary =
    edits.length === 1
      ? edits[0].label
      : `${edits.length} changes across ${[...touchedSlugs].sort().join(", ")}`;
  await commitFiles(files, `Editor${editorName ? ` (${editorName})` : ""}: ${summary}`);
}
