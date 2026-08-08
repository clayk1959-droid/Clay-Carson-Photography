import { SiteHeader } from "../SiteHeader";
import { CollectionsIndex } from "./CollectionsIndex";

const cards = [
  {
    "slug": "christian",
    "title": "Christian",
    "person": [],
    "event": [],
    "count": 16,
    "coverBasename": "christian-01.jpg"
  },
  {
    "slug": "gulf-shores-2025",
    "title": "Gulf Shores 2025",
    "person": [],
    "event": [],
    "count": 16,
    "coverBasename": "gulf-shores-2025-14.jpg"
  },
  {
    "slug": "norway",
    "title": "Norway",
    "person": [],
    "event": [],
    "count": 43,
    "coverBasename": "norway-13.jpg"
  },
  {
    "slug": "janet-buys-a-car",
    "title": "Janet Buys a car",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "count": 13,
    "coverBasename": "janet-buys-a-car-01.jpg"
  }
];

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Collections</h1>
        <CollectionsIndex cards={cards} />
      </section>
    </main>
  );
}
