import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

const photographData = [
  {
    "caption": "August 10, 2025 — Copenhagen Day one 2",
    "altText": "Copenhagen Day one 2",
    "width": 2200,
    "height": 1388
  },
  {
    "caption": "August 10, 2025 — Copenhagen Day one 6",
    "altText": "Copenhagen Day one 6",
    "width": 2200,
    "height": 1897
  },
  {
    "caption": "August 10, 2025 — Copenhagen Day one 8",
    "altText": "Copenhagen Day one 8",
    "width": 2200,
    "height": 1464
  },
  {
    "caption": "August 15, 2025 — Copenhagen 1",
    "altText": "Copenhagen 1",
    "width": 2200,
    "height": 1174
  },
  {
    "caption": "August 15, 2025 — Copenhagen 3",
    "altText": "Copenhagen 3",
    "width": 1810,
    "height": 2200
  },
  {
    "caption": "August 15, 2025 — Copenhagen 4",
    "altText": "Copenhagen 4",
    "width": 1488,
    "height": 2200
  },
  {
    "caption": "August 11, 2025 — Costal Walk-On Boat 4",
    "altText": "Costal Walk-On Boat 4",
    "width": 2200,
    "height": 2076
  },
  {
    "caption": "August 11, 2025 — Costal Walk-On Boat 5",
    "altText": "Costal Walk-On Boat 5",
    "width": 2200,
    "height": 1357
  },
  {
    "caption": "August 11, 2025 — Costal Walki 1",
    "altText": "Costal Walki 1",
    "width": 2200,
    "height": 1129
  },
  {
    "caption": "August 10, 2025 — Fram",
    "altText": "Fram",
    "width": 2200,
    "height": 2135
  },
  {
    "caption": "August 15, 2025 — Garden 1 (2)",
    "altText": "Garden 1 (2)",
    "width": 1754,
    "height": 2200
  },
  {
    "caption": "August 15, 2025 — Garden 2",
    "altText": "Garden 2",
    "width": 2200,
    "height": 1741
  },
  {
    "caption": "August 11, 2025 — North Point 1 (2)",
    "altText": "North Point 1 (2)",
    "width": 2200,
    "height": 1483
  },
  {
    "caption": "August 12, 2025 — North Point 3 (2)",
    "altText": "North Point 3 (2)",
    "width": 2200,
    "height": 1402
  },
  {
    "caption": "August 10, 2025 — On Boat 1",
    "altText": "On Boat 1",
    "width": 2200,
    "height": 1604
  },
  {
    "caption": "August 10, 2025 — On Boat 3",
    "altText": "On Boat 3",
    "width": 2200,
    "height": 1766
  },
  {
    "caption": "August 10, 2025 — On Boat 4",
    "altText": "On Boat 4",
    "width": 2200,
    "height": 1298
  },
  {
    "caption": "August 10, 2025 — Oslo walk Scooters",
    "altText": "Oslo walk Scooters",
    "width": 2107,
    "height": 2200
  },
  {
    "caption": "August 12, 2025 — Sod House 2",
    "altText": "Sod House 2",
    "width": 2200,
    "height": 1211
  },
  {
    "caption": "August 11, 2025 — Statue Garden 1 (2)",
    "altText": "Statue Garden 1 (2)",
    "width": 2200,
    "height": 1493
  },
  {
    "caption": "August 11, 2025 — Statue Garden 3 (2)",
    "altText": "Statue Garden 3 (2)",
    "width": 2200,
    "height": 1606
  },
  {
    "caption": "August 10, 2025 — Statue Garden 3",
    "altText": "Statue Garden 3",
    "width": 1630,
    "height": 2017
  },
  {
    "caption": "August 10, 2025 — Statue Garden 5",
    "altText": "Statue Garden 5",
    "width": 2200,
    "height": 1318
  },
  {
    "caption": "August 10, 2025 — Statue Garden 7",
    "altText": "Statue Garden 7",
    "width": 2020,
    "height": 2200
  },
  {
    "caption": "August 10, 2025 — Accordian 1",
    "altText": "Accordian 1",
    "width": 2200,
    "height": 1487
  },
  {
    "caption": "August 12, 2025 — Bdoor",
    "altText": "Bdoor",
    "width": 269,
    "height": 403
  },
  {
    "caption": "August 12, 2025 — Boat Name 1",
    "altText": "Boat Name 1",
    "width": 2200,
    "height": 1563
  },
  {
    "caption": "August 12, 2025 — Boat ride 1",
    "altText": "Boat ride 1",
    "width": 2200,
    "height": 1555
  },
  {
    "caption": "August 12, 2025 — Boat ride 5",
    "altText": "Boat ride 5",
    "width": 2200,
    "height": 1497
  },
  {
    "caption": "August 12, 2025 — Copenhagen 1",
    "altText": "Copenhagen 1",
    "width": 2200,
    "height": 1407
  },
  {
    "caption": "August 12, 2025 — Copenhagen 5",
    "altText": "Copenhagen 5",
    "width": 2200,
    "height": 1286
  },
  {
    "caption": "August 12, 2025 — Copenhagen 7",
    "altText": "Copenhagen 7",
    "width": 2200,
    "height": 1246
  },
  {
    "caption": "August 12, 2025 — Copenhagen 9",
    "altText": "Copenhagen 9",
    "width": 2200,
    "height": 1336
  },
  {
    "caption": "August 13, 2025 — Costal walk 2",
    "altText": "Costal walk 2",
    "width": 2200,
    "height": 1320
  },
  {
    "caption": "August 13, 2025 — Costal walk 4",
    "altText": "Costal walk 4",
    "width": 2200,
    "height": 1665
  },
  {
    "caption": "August 14, 2025 — boat 12",
    "altText": "boat 12",
    "width": 1528,
    "height": 2200
  },
  {
    "caption": "August 14, 2025 — boat 13",
    "altText": "boat 13",
    "width": 2200,
    "height": 1676
  },
  {
    "caption": "August 13, 2025 — boat 3",
    "altText": "boat 3",
    "width": 2200,
    "height": 1558
  },
  {
    "caption": "August 13, 2025 — boat 4",
    "altText": "boat 4",
    "width": 2200,
    "height": 1430
  },
  {
    "caption": "August 13, 2025 — boat 5",
    "altText": "boat 5",
    "width": 1840,
    "height": 2200
  },
  {
    "caption": "August 16, 2025 — 1",
    "altText": "1",
    "width": 2200,
    "height": 1438
  },
  {
    "caption": "August 16, 2025 — 7",
    "altText": "7",
    "width": 2200,
    "height": 1557
  }
];

const photographs = photographData.map((photograph, index) => ({
  ...photograph,
  src: `/galleries/norway/norway-${String(index + 1).padStart(2, "0")}.jpg`,
}));

export default function NorwayPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Norway</h1>
        <p>42 photographs</p>
      </header>
      <Gallery name="Norway" photographs={photographs} />
    </main>
  );
}
