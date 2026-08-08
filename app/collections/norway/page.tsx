import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

type PhotographDataEntry = { filename: string; date: string | null; description: string; caption: string; altText: string; person: string[]; event: string[]; width: number; height: number };

const photographData: PhotographDataEntry[] = [
  {
    "filename": "BEACH- Battleship Big Guns_2.tif",
    "date": "2025-09-14",
    "description": "Battleship Big Guns 2",
    "caption": "September 14, 2025 — Battleship Big Guns 2",
    "altText": "Battleship Big Guns 2",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 687
  },
  {
    "filename": "NORWAY- Copenhagen Day one_2.tif",
    "date": "2025-08-10",
    "description": "Copenhagen Day one 2",
    "caption": "August 10, 2025 — Copenhagen Day one 2",
    "altText": "Copenhagen Day one 2",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1388
  },
  {
    "filename": "NORWAY- Copenhagen Day one_6.tif",
    "date": "2025-08-10",
    "description": "Copenhagen Day one 6",
    "caption": "August 10, 2025 — Copenhagen Day one 6",
    "altText": "Copenhagen Day one 6",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1897
  },
  {
    "filename": "NORWAY- Copenhagen Day one_8.tif",
    "date": "2025-08-10",
    "description": "Copenhagen Day one 8",
    "caption": "August 10, 2025 — Copenhagen Day one 8",
    "altText": "Copenhagen Day one 8",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "NORWAY- Copenhagen_1.tif",
    "date": "2025-08-15",
    "description": "Copenhagen 1",
    "caption": "August 15, 2025 — Copenhagen 1",
    "altText": "Copenhagen 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1174
  },
  {
    "filename": "NORWAY- Copenhagen_3.tif",
    "date": "2025-08-15",
    "description": "Copenhagen 3",
    "caption": "August 15, 2025 — Copenhagen 3",
    "altText": "Copenhagen 3",
    "person": [],
    "event": [],
    "width": 1810,
    "height": 2200
  },
  {
    "filename": "NORWAY- Copenhagen_4.tif",
    "date": "2025-08-15",
    "description": "Copenhagen 4",
    "caption": "August 15, 2025 — Copenhagen 4",
    "altText": "Copenhagen 4",
    "person": [],
    "event": [],
    "width": 1488,
    "height": 2200
  },
  {
    "filename": "NORWAY- Costal Walk-On Boat_4.tif",
    "date": "2025-08-11",
    "description": "Costal Walk-On Boat 4",
    "caption": "August 11, 2025 — Costal Walk-On Boat 4",
    "altText": "Costal Walk-On Boat 4",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 2076
  },
  {
    "filename": "NORWAY- Costal Walk-On Boat_5.tif",
    "date": "2025-08-11",
    "description": "Costal Walk-On Boat 5",
    "caption": "August 11, 2025 — Costal Walk-On Boat 5",
    "altText": "Costal Walk-On Boat 5",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1357
  },
  {
    "filename": "NORWAY- Costal Walki_1.tif",
    "date": "2025-08-11",
    "description": "Costal Walki 1",
    "caption": "August 11, 2025 — Costal Walki 1",
    "altText": "Costal Walki 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1129
  },
  {
    "filename": "NORWAY- Fram.tif",
    "date": "2025-08-10",
    "description": "Fram",
    "caption": "August 10, 2025 — Fram",
    "altText": "Fram",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 2135
  },
  {
    "filename": "NORWAY- Garden_1 (2).tif",
    "date": "2025-08-15",
    "description": "Garden 1 (2)",
    "caption": "August 15, 2025 — Garden 1 (2)",
    "altText": "Garden 1 (2)",
    "person": [],
    "event": [],
    "width": 1754,
    "height": 2200
  },
  {
    "filename": "NORWAY- Garden_2.tif",
    "date": "2025-08-15",
    "description": "Garden 2",
    "caption": "August 15, 2025 — Garden 2",
    "altText": "Garden 2",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1741
  },
  {
    "filename": "NORWAY- North Point_1 (2).tif",
    "date": "2025-08-11",
    "description": "North Point 1 (2)",
    "caption": "August 11, 2025 — North Point 1 (2)",
    "altText": "North Point 1 (2)",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1483
  },
  {
    "filename": "NORWAY- North Point_3 (2).tif",
    "date": "2025-08-12",
    "description": "North Point 3 (2)",
    "caption": "August 12, 2025 — North Point 3 (2)",
    "altText": "North Point 3 (2)",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1402
  },
  {
    "filename": "NORWAY- On Boat_1.tif",
    "date": "2025-08-10",
    "description": "On Boat 1",
    "caption": "August 10, 2025 — On Boat 1",
    "altText": "On Boat 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1604
  },
  {
    "filename": "NORWAY- On Boat_3.tif",
    "date": "2025-08-10",
    "description": "On Boat 3",
    "caption": "August 10, 2025 — On Boat 3",
    "altText": "On Boat 3",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1766
  },
  {
    "filename": "NORWAY- On Boat_4.tif",
    "date": "2025-08-10",
    "description": "On Boat 4",
    "caption": "August 10, 2025 — On Boat 4",
    "altText": "On Boat 4",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1298
  },
  {
    "filename": "NORWAY- Oslo walk_Scooters.tif",
    "date": "2025-08-10",
    "description": "Oslo walk Scooters",
    "caption": "August 10, 2025 — Oslo walk Scooters",
    "altText": "Oslo walk Scooters",
    "person": [],
    "event": [],
    "width": 2107,
    "height": 2200
  },
  {
    "filename": "NORWAY- Sod House_2.tif",
    "date": "2025-08-12",
    "description": "Sod House 2",
    "caption": "August 12, 2025 — Sod House 2",
    "altText": "Sod House 2",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1211
  },
  {
    "filename": "NORWAY- Statue Garden_1 (2).tif",
    "date": "2025-08-11",
    "description": "Statue Garden 1 (2)",
    "caption": "August 11, 2025 — Statue Garden 1 (2)",
    "altText": "Statue Garden 1 (2)",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1493
  },
  {
    "filename": "NORWAY- Statue Garden_3 (2).tif",
    "date": "2025-08-11",
    "description": "Statue Garden 3 (2)",
    "caption": "August 11, 2025 — Statue Garden 3 (2)",
    "altText": "Statue Garden 3 (2)",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1606
  },
  {
    "filename": "NORWAY- Statue Garden_3.tif",
    "date": "2025-08-10",
    "description": "Statue Garden 3",
    "caption": "August 10, 2025 — Statue Garden 3",
    "altText": "Statue Garden 3",
    "person": [],
    "event": [],
    "width": 1630,
    "height": 2017
  },
  {
    "filename": "NORWAY- Statue Garden_5.tif",
    "date": "2025-08-10",
    "description": "Statue Garden 5",
    "caption": "August 10, 2025 — Statue Garden 5",
    "altText": "Statue Garden 5",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1318
  },
  {
    "filename": "NORWAY- Statue Garden_7.tif",
    "date": "2025-08-10",
    "description": "Statue Garden 7",
    "caption": "August 10, 2025 — Statue Garden 7",
    "altText": "Statue Garden 7",
    "person": [],
    "event": [],
    "width": 2020,
    "height": 2200
  },
  {
    "filename": "NORWAY-Accordian_1.tif",
    "date": "2025-08-10",
    "description": "Accordian 1",
    "caption": "August 10, 2025 — Accordian 1",
    "altText": "Accordian 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1487
  },
  {
    "filename": "NORWAY-Bdoor.tif",
    "date": "2025-08-12",
    "description": "Bdoor",
    "caption": "August 12, 2025 — Bdoor",
    "altText": "Bdoor",
    "person": [],
    "event": [],
    "width": 269,
    "height": 403
  },
  {
    "filename": "NORWAY-Boat Name_1.tif",
    "date": "2025-08-12",
    "description": "Boat Name 1",
    "caption": "August 12, 2025 — Boat Name 1",
    "altText": "Boat Name 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1563
  },
  {
    "filename": "NORWAY-Boat ride_1.tif",
    "date": "2025-08-12",
    "description": "Boat ride 1",
    "caption": "August 12, 2025 — Boat ride 1",
    "altText": "Boat ride 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1555
  },
  {
    "filename": "NORWAY-Boat ride_5.tif",
    "date": "2025-08-12",
    "description": "Boat ride 5",
    "caption": "August 12, 2025 — Boat ride 5",
    "altText": "Boat ride 5",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1497
  },
  {
    "filename": "NORWAY-Copenhagen_1.tif",
    "date": "2025-08-12",
    "description": "Copenhagen 1",
    "caption": "August 12, 2025 — Copenhagen 1",
    "altText": "Copenhagen 1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1407
  },
  {
    "filename": "NORWAY-Copenhagen_5.tif",
    "date": "2025-08-12",
    "description": "Copenhagen 5",
    "caption": "August 12, 2025 — Copenhagen 5",
    "altText": "Copenhagen 5",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1286
  },
  {
    "filename": "NORWAY-Copenhagen_7.tif",
    "date": "2025-08-12",
    "description": "Copenhagen 7",
    "caption": "August 12, 2025 — Copenhagen 7",
    "altText": "Copenhagen 7",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1246
  },
  {
    "filename": "NORWAY-Copenhagen_9.tif",
    "date": "2025-08-12",
    "description": "Copenhagen 9",
    "caption": "August 12, 2025 — Copenhagen 9",
    "altText": "Copenhagen 9",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1336
  },
  {
    "filename": "NORWAY-Costal walk_2.tif",
    "date": "2025-08-13",
    "description": "Costal walk 2",
    "caption": "August 13, 2025 — Costal walk 2",
    "altText": "Costal walk 2",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1320
  },
  {
    "filename": "NORWAY-Costal walk_4.tif",
    "date": "2025-08-13",
    "description": "Costal walk 4",
    "caption": "August 13, 2025 — Costal walk 4",
    "altText": "Costal walk 4",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1665
  },
  {
    "filename": "NORWAY-boat_12.tif",
    "date": "2025-08-14",
    "description": "boat 12",
    "caption": "August 14, 2025 — boat 12",
    "altText": "boat 12",
    "person": [],
    "event": [],
    "width": 1528,
    "height": 2200
  },
  {
    "filename": "NORWAY-boat_13.tif",
    "date": "2025-08-14",
    "description": "boat 13",
    "caption": "August 14, 2025 — boat 13",
    "altText": "boat 13",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1676
  },
  {
    "filename": "NORWAY-boat_3.tif",
    "date": "2025-08-13",
    "description": "boat 3",
    "caption": "August 13, 2025 — boat 3",
    "altText": "boat 3",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1558
  },
  {
    "filename": "NORWAY-boat_4.tif",
    "date": "2025-08-13",
    "description": "boat 4",
    "caption": "August 13, 2025 — boat 4",
    "altText": "boat 4",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1430
  },
  {
    "filename": "NORWAY-boat_5.tif",
    "date": "2025-08-13",
    "description": "boat 5",
    "caption": "August 13, 2025 — boat 5",
    "altText": "boat 5",
    "person": [],
    "event": [],
    "width": 1840,
    "height": 2200
  },
  {
    "filename": "NORWAY_1.tif",
    "date": "2025-08-16",
    "description": "1",
    "caption": "August 16, 2025 — 1",
    "altText": "1",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1438
  },
  {
    "filename": "NORWAY_7.tif",
    "date": "2025-08-16",
    "description": "7",
    "caption": "August 16, 2025 — 7",
    "altText": "7",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1557
  }
];

const displayOrder: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 1, 43];

const photographs = displayOrder.map((number) => ({
  ...photographData[number - 1],
  src: `/galleries/norway/norway-${String(number).padStart(2, "0")}.jpg`,
}));

const otherCollections = [
  {
    "slug": "christian",
    "title": "Christian"
  },
  {
    "slug": "gulf-shores-2025",
    "title": "Gulf Shores 2025"
  },
  {
    "slug": "trip-to-nova-scotia",
    "title": "Trip to Nova Scotia"
  },
  {
    "slug": "janet-buys-a-car",
    "title": "Janet Buys a car"
  }
];

export default function NorwayPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Norway</h1>
        <p>43 photographs</p>
      </header>
      <Gallery
        name="Norway"
        slug="norway"
        photographs={photographs}
        otherCollections={otherCollections}
        editable={process.env.NODE_ENV === "development"}
      />
    </main>
  );
}
