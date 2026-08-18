"use client";

import { useEffect, useMemo, useState } from "react";

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

const ALL = "All";

export function CollectionsIndex({ cards, photos }: { cards: CollectionCard[]; photos: IndexPhoto[] }) {
  const [selectedPerson, setSelectedPerson] = useState(ALL);
  const [selectedEvent, setSelectedEvent] = useState(ALL);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  const people = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.person))).sort(),
    [cards],
  );
  const events = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.event))).sort(),
    [cards],
  );

  const isSearching = selectedPerson !== ALL || selectedEvent !== ALL;

  const matchingPhotos = useMemo(
    () =>
      photos.filter(
        (photo) =>
          (selectedPerson === ALL || photo.person.includes(selectedPerson)) &&
          (selectedEvent === ALL || photo.event.includes(selectedEvent)),
      ),
    [photos, selectedPerson, selectedEvent],
  );

  function clearSearch() {
    setSelectedPerson(ALL);
    setSelectedEvent(ALL);
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
            <FilterSelect
              label="People"
              value={selectedPerson}
              options={people}
              onChange={(value) => {
                setSelectedPerson(value);
                setActivePhoto(null);
              }}
            />
          )}
          {events.length > 0 && (
            <FilterSelect
              label="Events"
              value={selectedEvent}
              options={events}
              onChange={(value) => {
                setSelectedEvent(value);
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="collections-filter-group">
      <span className="collections-filter-label">{label}</span>
      <select
        className="collections-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={ALL}>{ALL}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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
