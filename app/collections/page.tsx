import { SiteHeader } from "../SiteHeader";
import { CollectionsIndex } from "./CollectionsIndex";

const cards = [
  {
    "slug": "janet-buys-a-car",
    "title": "Janet Buys a car",
    "person": [
      "Albert Everett",
      "Alex Brandon",
      "Clay Carson",
      "DSandy Covem Church Point",
      "Digby",
      "Janet Carson",
      "Mark Cobard",
      "Phylis Conard"
    ],
    "event": [
      "Janet buys a car"
    ],
    "count": 14,
    "coverBasename": "janet-buys-a-car-01.jpg"
  },
  {
    "slug": "nova-scotia",
    "title": "Nova Scotia",
    "person": [
      "Albert Everett",
      "Alex Brandon",
      "Carol Mendal",
      "Carol Mendal. Janet Carson",
      "Janet Carson",
      "Karen",
      "Mark Conard",
      "Phylis Conard",
      "Phyllis Conard",
      "y"
    ],
    "event": [],
    "count": 73,
    "coverBasename": "nova-scotia-40.jpg"
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
