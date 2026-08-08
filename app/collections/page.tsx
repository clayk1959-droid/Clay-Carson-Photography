import { SiteHeader } from "../SiteHeader";
import { CollectionsIndex } from "./CollectionsIndex";

const cards = [
  {
    "slug": "christian",
    "title": "Christian",
    "person": [
      "Christian"
    ],
    "event": [],
    "count": 16,
    "coverBasename": "christian-01.jpg"
  },
  {
    "slug": "gulf-shores-2025",
    "title": "Gulf Shores 2025",
    "person": [],
    "event": [
      "Gulf Shores 2025"
    ],
    "count": 16,
    "coverBasename": "gulf-shores-2025-14.jpg"
  },
  {
    "slug": "norway",
    "title": "Norway",
    "person": [],
    "event": [
      "Norway"
    ],
    "count": 43,
    "coverBasename": "norway-13.jpg"
  },
  {
    "slug": "trip-to-nova-scotia",
    "title": "Trip to Nova Scotia",
    "person": [
      "Clay Carson"
    ],
    "event": [
      "Trip with friends"
    ],
    "count": 0,
    "coverBasename": "trip-to-nova-scotia-01.jpg"
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
