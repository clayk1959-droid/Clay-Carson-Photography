import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

type PhotographDataEntry = { filename: string; date: string | null; description: string; caption: string; altText: string; person: string[]; event: string[]; width: number; height: number };

const photographData: PhotographDataEntry[] = [
  {
    "filename": "L1019987.jpg",
    "date": "2026-08-17",
    "description": "Living room at Chutch Point",
    "caption": "August 17, 2026 — Living room at Chutch Point",
    "altText": "Living room at Chutch Point",
    "person": [
      "Janet Carson",
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1019992.jpg",
    "date": "2026-08-17",
    "description": "L1019992",
    "caption": "August 17, 2026 — L1019992",
    "altText": "L1019992",
    "person": [
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1019997.jpg",
    "date": "2026-08-17",
    "description": "Relaxing on the deck",
    "caption": "August 17, 2026 — Relaxing on the deck",
    "altText": "Relaxing on the deck",
    "person": [
      "Albert Everett",
      "Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020004.jpg",
    "date": "2026-08-17",
    "description": "Exploring the yard",
    "caption": "August 17, 2026 — Exploring the yard",
    "altText": "Exploring the yard",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020029.jpg",
    "date": "2026-08-17",
    "description": "Exploring lighthouse on the first day",
    "caption": "August 17, 2026 — Exploring lighthouse on the first day",
    "altText": "Exploring lighthouse on the first day",
    "person": [
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1579
  },
  {
    "filename": "L1020055.jpg",
    "date": "2026-08-17",
    "description": "L1020055",
    "caption": "August 17, 2026 — L1020055",
    "altText": "L1020055",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1465
  },
  {
    "filename": "L1020063.jpg",
    "date": "2026-08-17",
    "description": "L1020063",
    "caption": "August 17, 2026 — L1020063",
    "altText": "L1020063",
    "person": [
      "Mark Conard",
      "Albert Everett"
    ],
    "event": [],
    "width": 2200,
    "height": 1463
  },
  {
    "filename": "L1020078.jpg",
    "date": "2026-08-17",
    "description": "Albert and Karen in front ot ftheir family home",
    "caption": "August 17, 2026 — Albert and Karen in front ot ftheir family home",
    "altText": "Albert and Karen in front ot ftheir family home",
    "person": [
      "Albert Everett",
      "Karen"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020089.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020102.jpg",
    "date": "2026-08-17",
    "description": "Sandy Cove family home",
    "caption": "August 17, 2026 — Sandy Cove family home",
    "altText": "Sandy Cove family home",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020121.jpg",
    "date": "2026-08-17",
    "description": "Sandy Cove family home",
    "caption": "August 17, 2026 — Sandy Cove family home",
    "altText": "Sandy Cove family home",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1950
  },
  {
    "filename": "L1020141.jpg",
    "date": "2026-08-17",
    "description": "Albert and Karen in front yard",
    "caption": "August 17, 2026 — Albert and Karen in front yard",
    "altText": "Albert and Karen in front yard",
    "person": [
      "Albert Everett",
      "Karen"
    ],
    "event": [],
    "width": 2200,
    "height": 1463
  },
  {
    "filename": "L1020157.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020158.jpg",
    "date": "2026-08-17",
    "description": "Albert and Karen",
    "caption": "August 17, 2026 — Albert and Karen",
    "altText": "Albert and Karen",
    "person": [
      "Albert Everett",
      "Karen"
    ],
    "event": [],
    "width": 1257,
    "height": 1385
  },
  {
    "filename": "L1020165.jpg",
    "date": "2026-08-17",
    "description": "Grandpa’s home",
    "caption": "August 17, 2026 — Grandpa’s home",
    "altText": "Grandpa’s home",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020174.jpg",
    "date": "2026-08-17",
    "description": "L1020174",
    "caption": "August 17, 2026 — L1020174",
    "altText": "L1020174",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1327
  },
  {
    "filename": "L1020198.jpg",
    "date": "2026-08-17",
    "description": "Sandy Cove cemetary",
    "caption": "August 17, 2026 — Sandy Cove cemetary",
    "altText": "Sandy Cove cemetary",
    "person": [
      "Albert Everett",
      "Alex Brandon",
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020235.jpg",
    "date": "2026-08-17",
    "description": "Sandy Cove cemetary",
    "caption": "August 17, 2026 — Sandy Cove cemetary",
    "altText": "Sandy Cove cemetary",
    "person": [
      "Albert Everett"
    ],
    "event": [],
    "width": 2200,
    "height": 1653
  },
  {
    "filename": "L1020242.jpg",
    "date": "2026-08-17",
    "description": "Sandy Cove cemetary",
    "caption": "August 17, 2026 — Sandy Cove cemetary",
    "altText": "Sandy Cove cemetary",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1616
  },
  {
    "filename": "L1020254.jpg",
    "date": "2026-08-17",
    "description": "Sandy Cove cemetary",
    "caption": "August 17, 2026 — Sandy Cove cemetary",
    "altText": "Sandy Cove cemetary",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020277.jpg",
    "date": "2026-08-17",
    "description": "L1020277",
    "caption": "August 17, 2026 — L1020277",
    "altText": "L1020277",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1463
  },
  {
    "filename": "L1020302.jpg",
    "date": "2026-08-17",
    "description": "Carol poses at sunset",
    "caption": "August 17, 2026 — Carol poses at sunset",
    "altText": "Carol poses at sunset",
    "person": [
      "Carol Mendal"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020332.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020338.jpg",
    "date": "2026-08-17",
    "description": "Deck view",
    "caption": "August 17, 2026 — Deck view",
    "altText": "Deck view",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020361.jpg",
    "date": "2026-08-17",
    "description": "Home base Church Point",
    "caption": "August 17, 2026 — Home base Church Point",
    "altText": "Home base Church Point",
    "person": [
      "Janet Carson",
      "Phylis Conard",
      "Carol Mendal"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020365.jpg",
    "date": "2026-08-17",
    "description": "L1020365",
    "caption": "August 17, 2026 — L1020365",
    "altText": "L1020365",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1479
  },
  {
    "filename": "L1020370.jpg",
    "date": "2026-08-17",
    "description": "L1020370",
    "caption": "August 17, 2026 — L1020370",
    "altText": "L1020370",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1512
  },
  {
    "filename": "L1020376.jpg",
    "date": "2026-08-17",
    "description": "L1020376",
    "caption": "August 17, 2026 — L1020376",
    "altText": "L1020376",
    "person": [
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020380.jpg",
    "date": "2026-08-17",
    "description": "L1020380",
    "caption": "August 17, 2026 — L1020380",
    "altText": "L1020380",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020386.jpg",
    "date": "2026-08-17",
    "description": "L1020386",
    "caption": "August 17, 2026 — L1020386",
    "altText": "L1020386",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1854
  },
  {
    "filename": "L1020395.jpg",
    "date": "2026-08-17",
    "description": "L1020395",
    "caption": "August 17, 2026 — L1020395",
    "altText": "L1020395",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020416.jpg",
    "date": "2026-08-17",
    "description": "An excuse to rest while climbing lighthouse",
    "caption": "August 17, 2026 — An excuse to rest while climbing lighthouse",
    "altText": "An excuse to rest while climbing lighthouse",
    "person": [],
    "event": [],
    "width": 1306,
    "height": 2200
  },
  {
    "filename": "L1020449.jpg",
    "date": "2026-08-17",
    "description": "L1020449",
    "caption": "August 17, 2026 — L1020449",
    "altText": "L1020449",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020461.jpg",
    "date": "2026-08-17",
    "description": "Ferryto whale watching",
    "caption": "August 17, 2026 — Ferryto whale watching",
    "altText": "Ferryto whale watching",
    "person": [
      "y"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020473.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020496.jpg",
    "date": "2026-08-17",
    "description": "L1020496",
    "caption": "August 17, 2026 — L1020496",
    "altText": "L1020496",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1467
  },
  {
    "filename": "L1020511.jpg",
    "date": "2026-08-17",
    "description": "Lighthouse",
    "caption": "August 17, 2026 — Lighthouse",
    "altText": "Lighthouse",
    "person": [
      "Carol Mendal. Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020514.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020525.jpg",
    "date": "2026-08-17",
    "description": "Lighthouse",
    "caption": "August 17, 2026 — Lighthouse",
    "altText": "Lighthouse",
    "person": [
      "Carol Mendal. Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1442
  },
  {
    "filename": "L1020539.jpg",
    "date": "2026-08-17",
    "description": "Lighthouse",
    "caption": "August 17, 2026 — Lighthouse",
    "altText": "Lighthouse",
    "person": [
      "Carol Mendal. Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1675
  },
  {
    "filename": "L1020541.jpg",
    "date": "2026-08-17",
    "description": "L1020541",
    "caption": "August 17, 2026 — L1020541",
    "altText": "L1020541",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1530
  },
  {
    "filename": "L1020550.jpg",
    "date": "2026-08-17",
    "description": "L1020550",
    "caption": "August 17, 2026 — L1020550",
    "altText": "L1020550",
    "person": [],
    "event": [],
    "width": 1091,
    "height": 680
  },
  {
    "filename": "L1020560.jpg",
    "date": "2026-08-17",
    "description": "L1020560",
    "caption": "August 17, 2026 — L1020560",
    "altText": "L1020560",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020586.jpg",
    "date": "2026-08-17",
    "description": "L1020586",
    "caption": "August 17, 2026 — L1020586",
    "altText": "L1020586",
    "person": [],
    "event": [],
    "width": 2155,
    "height": 2200
  },
  {
    "filename": "L1020595.jpg",
    "date": "2026-08-17",
    "description": "Fine dining at the ferry",
    "caption": "August 17, 2026 — Fine dining at the ferry",
    "altText": "Fine dining at the ferry",
    "person": [
      "Phyllis Conard",
      "Carol Mendal",
      "Janet Carson",
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1020615.jpg",
    "date": "2026-08-17",
    "description": "Crazy kids",
    "caption": "August 17, 2026 — Crazy kids",
    "altText": "Crazy kids",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1423
  },
  {
    "filename": "L1020651.jpg",
    "date": "2026-08-17",
    "description": "L1020651",
    "caption": "August 17, 2026 — L1020651",
    "altText": "L1020651",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1252
  },
  {
    "filename": "L1020772.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020855.jpg",
    "date": "2026-08-17",
    "description": "Whale watching",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [],
    "event": [],
    "width": 2122,
    "height": 1443
  },
  {
    "filename": "L1020908.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1020971.jpg",
    "date": "2026-08-17",
    "description": "Whale watching",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1388
  },
  {
    "filename": "L1020991.jpg",
    "date": "2026-08-17",
    "description": "Whale watching.  Right underneath us",
    "caption": "August 17, 2026 — Whale watching.  Right underneath us",
    "altText": "Whale watching.  Right underneath us",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1441
  },
  {
    "filename": "L1020995.jpg",
    "date": "2026-08-17",
    "description": "Whale watching",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [],
    "event": [],
    "width": 1774,
    "height": 2200
  },
  {
    "filename": "L1021003.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1021059.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1021067.jpg",
    "date": "2026-08-17",
    "description": "Whale watching",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [],
    "event": [],
    "width": 663,
    "height": 414
  },
  {
    "filename": "L1021082.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1021088.jpg",
    "date": "2026-08-17",
    "description": "Whale watching",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [],
    "event": [],
    "width": 484,
    "height": 267
  },
  {
    "filename": "L1021098.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  },
  {
    "filename": "L1021113.jpg",
    "date": "2026-08-17",
    "description": "Whale watching",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1807
  },
  {
    "filename": "L1021146.jpg",
    "date": "2026-08-17",
    "description": "Light house",
    "caption": "August 17, 2026 — Light house",
    "altText": "Light house",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1185
  },
  {
    "filename": "L1021174.jpg",
    "date": "2026-08-17",
    "description": "L1021174",
    "caption": "August 17, 2026 — L1021174",
    "altText": "L1021174",
    "person": [
      "Janet Carson",
      "Phyllis Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1472
  },
  {
    "filename": "L1021176.jpg",
    "date": "2026-08-17",
    "description": "Bread buying decision time",
    "caption": "August 17, 2026 — Bread buying decision time",
    "altText": "Bread buying decision time",
    "person": [
      "Albert Everett",
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1568
  },
  {
    "filename": "L1021182.jpg",
    "date": "2026-08-17",
    "description": "He made the bread",
    "caption": "August 17, 2026 — He made the bread",
    "altText": "He made the bread",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "L1021187.jpg",
    "date": "2026-08-17",
    "description": "L1021187",
    "caption": "August 17, 2026 — L1021187",
    "altText": "L1021187",
    "person": [],
    "event": [],
    "width": 1156,
    "height": 747
  },
  {
    "filename": "L1021226.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove lighthouse",
    "caption": "August 17, 2026 — Peggy’s cove lighthouse",
    "altText": "Peggy’s cove lighthouse",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1445
  },
  {
    "filename": "L1021249.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove lighthouse",
    "caption": "August 17, 2026 — Peggy’s cove lighthouse",
    "altText": "Peggy’s cove lighthouse",
    "person": [],
    "event": [],
    "width": 1318,
    "height": 2200
  },
  {
    "filename": "L1021253.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove",
    "caption": "August 17, 2026 — Peggy’s cove",
    "altText": "Peggy’s cove",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1653
  },
  {
    "filename": "L1021261.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove",
    "caption": "August 17, 2026 — Peggy’s cove",
    "altText": "Peggy’s cove",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1383
  },
  {
    "filename": "L1021263.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove",
    "caption": "August 17, 2026 — Peggy’s cove",
    "altText": "Peggy’s cove",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1595
  },
  {
    "filename": "L1021276.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove",
    "caption": "August 17, 2026 — Peggy’s cove",
    "altText": "Peggy’s cove",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1411
  },
  {
    "filename": "L1021297.jpg",
    "date": "2026-08-17",
    "description": "Peggy’s cove",
    "caption": "August 17, 2026 — Peggy’s cove",
    "altText": "Peggy’s cove",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1013
  },
  {
    "filename": "Sunset.jpg",
    "date": null,
    "description": "",
    "caption": "",
    "altText": "",
    "person": [],
    "event": [],
    "width": 0,
    "height": 0
  }
];

const displayOrder: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 11, 10, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 51, 52, 53, 56, 58, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72];

const photographs = displayOrder.map((number) => ({
  ...photographData[number - 1],
  src: `/galleries/nova-scotia/nova-scotia-${String(number).padStart(2, "0")}.jpg`,
}));

const otherCollections = [
  {
    "slug": "janet-buys-a-car",
    "title": "Janet Buys a car"
  }
];

export default function NovaScotiaPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Nova Scotia</h1>
        <p>61 photographs</p>
      </header>
      <Gallery
        name="Nova Scotia"
        slug="nova-scotia"
        photographs={photographs}
        otherCollections={otherCollections}
        editable={process.env.NODE_ENV === "development"}
      />
    </main>
  );
}
