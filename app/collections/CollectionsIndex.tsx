"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CollectionCard = {
  slug: string;
  title: string;
  person: string[];
  event: string[];
  count: number;
  coverBasename: string;
  coverPosition: string;
};

type IndexPhoto = {
  collectionSlug: string;
  collectionTitle: string;
  filename: string;
  caption: string;
  altText: string;
  person: string[];
  event: string[];
  width: number;
  height: number;
  src: string;
};

// An empty selection means "All" — no separate All state to keep in sync.
export function CollectionsIndex({ cards, photos }: { cards: CollectionCard[]; photos: IndexPhoto[] }) {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  const people = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.person))).sort(),
    [cards],
  );
  const events = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.event))).sort(),
    [cards],
  );

  const isSearching = selectedPeople.length > 0 || selectedEvents.length > 0;

  const matchingPhotos = useMemo(
    () =>
      photos.filter(
        (photo) =>
          (selectedPeople.length === 0 || photo.person.some((p) => selectedPeople.includes(p))) &&
          (selectedEvents.length === 0 || photo.event.some((e) => selectedEvents.includes(e))),
      ),
    [photos, selectedPeople, selectedEvents],
  );

  function clearSearch() {
    setSelectedPeople([]);
    setSelectedEvents([]);
    setActivePhoto(null);
  }

  function showPreviousPhoto() {
    setActivePhoto((current) => (current === null || current === 0 ? current : current - 1));
  }

  function showNextPhoto() {
    setActivePhoto((current) =>
      current === null || current === matchingPhotos.length - 1 ? current : current + 1,
    );
  }

  return (
    <>
      {(people.length > 0 || events.length > 0) && (
        <div className="collections-filters">
          {people.length > 0 && (
            <MultiFilterSelect
              label="People"
              value={selectedPeople}
              options={people}
              onChange={(value) => {
                setSelectedPeople(value);
                setActivePhoto(null);
              }}
            />
          )}
          {events.length > 0 && (
            <MultiFilterSelect
              label="Events"
              value={selectedEvents}
              options={events}
              onChange={(value) => {
                setSelectedEvents(value);
                setActivePhoto(null);
              }}
            />
          )}
          {isSearching && (
            <button type="button" className="search-clear" onClick={clearSearch}>
              Clear ✕
            </button>
          )}
        </div>
      )}

      {isSearching ? (
        matchingPhotos.length === 0 ? (
          <p className="collections-empty">No photographs match that filter.</p>
        ) : (
          <>
            <p className="search-summary">
              {matchingPhotos.length} photograph{matchingPhotos.length === 1 ? "" : "s"}
            </p>
            <div className="photo-gallery">
              {matchingPhotos.map((photo, index) => (
                <button
                  key={`${photo.collectionSlug}-${photo.filename}`}
                  type="button"
                  className="gallery-thumb"
                  onClick={() => setActivePhoto(index)}
                  aria-label={`Open photograph ${index + 1} of ${matchingPhotos.length}`}
                >
                  <img
                    src={photo.src.replace("/galleries/", "/gallery-thumbnails/")}
                    alt={photo.altText}
                    width={photo.width}
                    height={photo.height}
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
          </>
        )
      ) : cards.length === 0 ? (
        <p className="collections-empty">No galleries yet.</p>
      ) : (
        <div className="collection-index">
          {cards.map((card) => (
            <a className="collection-card" href={`/collections/${card.slug}`} key={card.slug}>
              <div className="collection-cover">
                <img
                  src={`/gallery-thumbnails/${card.slug}/${card.coverBasename}`}
                  alt={`${card.title} gallery`}
                  style={{ objectPosition: card.coverPosition }}
                />
              </div>
              <div className="collection-details">
                <div>
                  <h2>{card.title}</h2>
                </div>
                <p className="collection-count">{card.count} photographs</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {activePhoto !== null && (
        <SearchLightbox
          photos={matchingPhotos}
          activePhoto={activePhoto}
          onClose={() => setActivePhoto(null)}
          onPrevious={showPreviousPhoto}
          onNext={showNextPhoto}
        />
      )}
    </>
  );
}

function MultiFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const summary =
    value.length === 0 ? "All" : value.length === 1 ? value[0] : `${value.length} selected`;

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div className="collections-filter-group" ref={containerRef}>
      <span className="collections-filter-label">{label}</span>
      <button
        type="button"
        className={open ? "collections-filter-select is-open" : "collections-filter-select"}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {summary}
      </button>
      {open && (
        <div
          className="collections-filter-menu"
          role="listbox"
          aria-label={label}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <label className="collections-filter-option">
            <span className="checkbox-wrap">
              <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} />
              <span className="checkbox-box" aria-hidden="true" />
            </span>
            All
          </label>
          {options.map((option) => (
            <label key={option} className="collections-filter-option">
              <span className="checkbox-wrap">
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={() => toggle(option)}
                />
                <span className="checkbox-box" aria-hidden="true" />
              </span>
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchLightbox({
  photos,
  activePhoto,
  onClose,
  onPrevious,
  onNext,
}: {
  photos: IndexPhoto[];
  activePhoto: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const photo = photos[activePhoto];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onPrevious, onNext]);

  if (!photo) return null;

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${activePhoto + 1} of ${photos.length}`}
      onClick={onClose}
    >
      <button className="lightbox-close" type="button" onClick={onClose} aria-label="Close photograph">
        Close
      </button>
      <button
        className="lightbox-arrow lightbox-previous"
        type="button"
        disabled={activePhoto === 0}
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        aria-label="Previous photograph"
      >
        ‹
      </button>
      <figure onClick={(event) => event.stopPropagation()}>
        <img src={photo.src} alt={photo.altText} width={photo.width} height={photo.height} />
        <figcaption>
          <span className="lightbox-caption">
            {photo.caption}
            <br />
            <a className="search-result-link" href={`/collections/${photo.collectionSlug}`}>
              From &ldquo;{photo.collectionTitle}&rdquo; →
            </a>
          </span>
          <span className="lightbox-count">
            {String(activePhoto + 1).padStart(2, "0")} / {photos.length}
          </span>
        </figcaption>
      </figure>
      <button
        className="lightbox-arrow lightbox-next"
        type="button"
        disabled={activePhoto === photos.length - 1}
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next photograph"
      >
        ›
      </button>
    </div>
  );
}
