"use client";

import { useMemo, useState } from "react";

type CollectionCard = {
  slug: string;
  title: string;
  person: string[];
  event: string[];
  count: number;
  coverBasename: string;
};

const ALL = "All";

export function CollectionsIndex({ cards }: { cards: CollectionCard[] }) {
  const [selectedPerson, setSelectedPerson] = useState(ALL);
  const [selectedEvent, setSelectedEvent] = useState(ALL);
  const [openGroup, setOpenGroup] = useState<"person" | "event" | null>(null);

  const people = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.person))).sort(),
    [cards],
  );
  const events = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.event))).sort(),
    [cards],
  );

  const visibleCards = cards.filter(
    (card) =>
      (selectedPerson === ALL || card.person.includes(selectedPerson)) &&
      (selectedEvent === ALL || card.event.includes(selectedEvent)),
  );

  return (
    <>
      {(people.length > 0 || events.length > 0) && (
        <div className="collections-filters">
          {people.length > 0 && (
            <div className="collections-filter-group">
              <button
                type="button"
                className={openGroup === "person" ? "collections-filter-toggle is-open" : "collections-filter-toggle"}
                onClick={() => setOpenGroup(openGroup === "person" ? null : "person")}
              >
                People{selectedPerson !== ALL ? `: ${selectedPerson}` : ""}
              </button>
              {openGroup === "person" && (
                <div className="filter-chip-row">
                  <FilterChip
                    label={ALL}
                    active={selectedPerson === ALL}
                    onClick={() => {
                      setSelectedPerson(ALL);
                      setOpenGroup(null);
                    }}
                  />
                  {people.map((person) => (
                    <FilterChip
                      key={person}
                      label={person}
                      active={selectedPerson === person}
                      onClick={() => {
                        setSelectedPerson(person);
                        setOpenGroup(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {events.length > 0 && (
            <div className="collections-filter-group">
              <button
                type="button"
                className={openGroup === "event" ? "collections-filter-toggle is-open" : "collections-filter-toggle"}
                onClick={() => setOpenGroup(openGroup === "event" ? null : "event")}
              >
                Events{selectedEvent !== ALL ? `: ${selectedEvent}` : ""}
              </button>
              {openGroup === "event" && (
                <div className="filter-chip-row">
                  <FilterChip
                    label={ALL}
                    active={selectedEvent === ALL}
                    onClick={() => {
                      setSelectedEvent(ALL);
                      setOpenGroup(null);
                    }}
                  />
                  {events.map((event) => (
                    <FilterChip
                      key={event}
                      label={event}
                      active={selectedEvent === event}
                      onClick={() => {
                        setSelectedEvent(event);
                        setOpenGroup(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {visibleCards.length === 0 ? (
        <p className="collections-empty">No collections match that filter.</p>
      ) : (
        <div className="collection-index">
          {visibleCards.map((card) => (
            <a className="collection-card" href={`/collections/${card.slug}`} key={card.slug}>
              <div className="collection-cover">
                <img
                  src={`/gallery-thumbnails/${card.slug}/${card.coverBasename}`}
                  alt={`${card.title} collection`}
                />
              </div>
              <div className="collection-details">
                <div>
                  <h2>{card.title}</h2>
                </div>
                <p className="collection-count">{card.count} photographs</p>
                <span className="collection-link">View collection&nbsp; →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "filter-chip is-active" : "filter-chip"}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
