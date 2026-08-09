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
            <FilterSelect
              label="People"
              value={selectedPerson}
              options={people}
              onChange={setSelectedPerson}
            />
          )}
          {events.length > 0 && (
            <FilterSelect
              label="Events"
              value={selectedEvent}
              options={events}
              onChange={setSelectedEvent}
            />
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
