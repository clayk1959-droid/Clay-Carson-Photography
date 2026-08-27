// Shared plumbing for the three edit routes' remote-mode branch
// (gallery-overrides, gallery-cover, gallery-reorder): fetch the current
// state of every relevant file fresh from GitHub, let the caller mutate
// the specific override(s), recompute displayOrder and the Collections-
// index card/photos entries using the exact same functions
// scripts/sync-gallery.mjs uses locally, and commit every file in one
// atomic commit. This is the remote equivalent of editing a local JSON
// file and then clicking "Sync Gallery".
import { getFileContent, commitFiles } from "./github-commit";
// Plain JS module, shared with scripts/sync-gallery.mjs so remote edits can
// never compute a different result than a local sync.
import {
  computeDisplayOrder,
  computeIndexCard,
  computeIndexPhotos,
  sortIndexCards,
} from "../scripts/lib/photo-ranking.mjs";

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
