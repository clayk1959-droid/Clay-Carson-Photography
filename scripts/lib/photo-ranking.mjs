// Pure functions for turning a collection's raw photo array + overrides into
// what actually ships: which photos are visible, what order they're in, and
// what a Collections-index card looks like. Shared between the local sync
// script (scripts/sync-gallery.mjs, which has access to the full-resolution
// "Gallery Originals" folder) and the remote editor's API routes (which only
// ever see the already-committed data/photo-data/*.json — no Gallery
// Originals access) so both paths compute the exact same result from the
// exact same inputs, and can never drift apart.

// Ties are broken in favor of a photo with an explicit order override, so a
// photo deliberately moved to a position wins against one that merely lands
// there by natural (filename) order.
export function computeDisplayOrder(photographData, collectionOverrides) {
  const ranked = photographData
    .map((photograph, index) => {
      const naturalRank = index + 1;
      const overrideOrder = collectionOverrides[photograph.filename]?.order;
      return { naturalRank, sortRank: overrideOrder ?? naturalRank, hasOverride: overrideOrder !== undefined };
    })
    .filter((entry) => !collectionOverrides[photographData[entry.naturalRank - 1].filename]?.hidden);
  ranked.sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
    if (a.hasOverride !== b.hasOverride) return a.hasOverride ? -1 : 1;
    return a.naturalRank - b.naturalRank;
  });
  return ranked.map((entry) => entry.naturalRank);
}

// Which photo (by 1-based natural rank) represents the collection on its
// Collections-page card. Falls back to the first visible photo when no
// cover is set, the requested cover photo no longer exists, or it's hidden.
export function computeCoverNumber(photographData, collectionOverrides, coverOverride, displayOrder) {
  const requestedCoverNumber = coverOverride.coverPhoto
    ? photographData.findIndex((photograph) => photograph.filename === coverOverride.coverPhoto) + 1
    : 1;
  const requestedFilename = photographData[requestedCoverNumber - 1]?.filename;
  return requestedCoverNumber < 1 || collectionOverrides[requestedFilename]?.hidden
    ? (displayOrder[0] ?? 1)
    : requestedCoverNumber;
}

export function computeIndexCard({ slug, title, photographData, collectionOverrides, displayOrder, coverOverride }) {
  const collectionPeople = new Set();
  const collectionEvents = new Set();
  for (const naturalRank of displayOrder) {
    const photo = photographData[naturalRank - 1];
    for (const p of photo.person ?? []) collectionPeople.add(p);
    for (const e of photo.event ?? []) collectionEvents.add(e);
  }
  const coverNumber = computeCoverNumber(photographData, collectionOverrides, coverOverride, displayOrder);
  return {
    slug,
    title,
    person: [...collectionPeople].sort(),
    event: [...collectionEvents].sort(),
    count: displayOrder.length,
    pinned: Boolean(coverOverride.pinnedAt),
    private: Boolean(coverOverride.private),
    coverToken: coverOverride.private ? coverOverride.coverToken ?? null : null,
    coverBasename: `${slug}-${String(coverNumber).padStart(2, "0")}.jpg`,
    coverPosition: coverOverride.coverPosition ?? "center center",
  };
}

// Order for the Collections-index cards: pinned collections first (most
// recently pinned on top, so nudging a newer one above an older pin just
// works), then everything else newest-created first. A collection with no
// recorded creation date yet (shouldn't happen after a collection's first
// sync, but covers a stale/partial overrides file) sinks to the very
// bottom rather than crashing or landing somewhere arbitrary.
export function sortIndexCards(cards, collectionMeta) {
  const timeOf = (value) => (value ? new Date(value).getTime() : null);
  return [...cards]
    .map((card, index) => ({ card, index, meta: collectionMeta[card.slug] ?? {} }))
    .sort((a, b) => {
      const aPinned = timeOf(a.meta.pinnedAt);
      const bPinned = timeOf(b.meta.pinnedAt);
      if (aPinned !== null && bPinned !== null) return bPinned - aPinned;
      if (aPinned !== null) return -1;
      if (bPinned !== null) return 1;

      const aCreated = timeOf(a.meta.firstSyncedAt);
      const bCreated = timeOf(b.meta.firstSyncedAt);
      if (aCreated !== null && bCreated !== null) return bCreated - aCreated;
      if (aCreated !== null) return -1;
      if (bCreated !== null) return 1;

      return a.index - b.index; // stable fallback when neither has a date
    })
    .map((entry) => entry.card);
}

// Flat list of every visible, tagged photo in the collection, for the
// person/event search on the Galleries page.
export function computeIndexPhotos({ slug, title, photographData, displayOrder }) {
  const entries = [];
  for (const naturalRank of displayOrder) {
    const photo = photographData[naturalRank - 1];
    if ((photo.person?.length ?? 0) > 0 || (photo.event?.length ?? 0) > 0) {
      entries.push({
        collectionSlug: slug,
        collectionTitle: title,
        filename: photo.filename,
        caption: photo.caption,
        altText: photo.altText,
        person: photo.person ?? [],
        event: photo.event ?? [],
        width: photo.width,
        height: photo.height,
        src: `/galleries/${slug}/${slug}-${String(naturalRank).padStart(2, "0")}.jpg`,
      });
    }
  }
  return entries;
}
