import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

type PhotographDataEntry = { filename: string; date: string | null; description: string; caption: string; altText: string; person: string[]; event: string[]; width: number; height: number };

const photographData: PhotographDataEntry[] = [
  {
    "filename": "Janet Buys a Car-10.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Waiting for credit guy to sell us something.",
    "caption": "August 8, 2026 — Janet Buys a Car - Waiting for credit guy to sell us something.",
    "altText": "Janet Buys a Car - Waiting for credit guy to sell us something.",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 1000,
    "height": 691
  },
  {
    "filename": "Janet Buys a Car-11.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Checking out window stickers",
    "caption": "August 8, 2026 — Janet Buys a Car - Checking out window stickers",
    "altText": "Janet Buys a Car - Checking out window stickers",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 800,
    "height": 545
  },
  {
    "filename": "Janet Buys a Car-12.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Sales guy was great.  Gave her the tour",
    "caption": "August 8, 2026 — Janet Buys a Car - Sales guy was great.  Gave her the tour",
    "altText": "Janet Buys a Car - Sales guy was great.  Gave her the tour",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 494
  },
  {
    "filename": "Janet Buys a Car-13.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Proud owner",
    "caption": "August 8, 2026 — Janet Buys a Car - Proud owner",
    "altText": "Janet Buys a Car - Proud owner",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 1000,
    "height": 687
  },
  {
    "filename": "Janet Buys a Car-2.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Learning all of the new features",
    "caption": "August 8, 2026 — Janet Buys a Car - Learning all of the new features",
    "altText": "Janet Buys a Car - Learning all of the new features",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 406
  },
  {
    "filename": "Janet Buys a Car-3.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - This guy is ready to make a deal.",
    "caption": "August 8, 2026 — Janet Buys a Car - This guy is ready to make a deal.",
    "altText": "Janet Buys a Car - This guy is ready to make a deal.",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 485
  },
  {
    "filename": "Janet Buys a Car-4.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Checking out window stickers",
    "caption": "August 8, 2026 — Janet Buys a Car - Checking out window stickers",
    "altText": "Janet Buys a Car - Checking out window stickers",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 403
  },
  {
    "filename": "Janet Buys a Car-5.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - More sales guy haggling",
    "caption": "August 8, 2026 — Janet Buys a Car - More sales guy haggling",
    "altText": "Janet Buys a Car - More sales guy haggling",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 527
  },
  {
    "filename": "Janet Buys a Car-6.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Really likes the cloth seats",
    "caption": "August 8, 2026 — Janet Buys a Car - Really likes the cloth seats",
    "altText": "Janet Buys a Car - Really likes the cloth seats",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 486
  },
  {
    "filename": "Janet Buys a Car-7.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Done deal!",
    "caption": "August 8, 2026 — Janet Buys a Car - Done deal!",
    "altText": "Janet Buys a Car - Done deal!",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 482
  },
  {
    "filename": "Janet Buys a Car-8.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Wiil the finance guy ever finish up?",
    "caption": "August 8, 2026 — Janet Buys a Car - Wiil the finance guy ever finish up?",
    "altText": "Janet Buys a Car - Wiil the finance guy ever finish up?",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 467
  },
  {
    "filename": "Janet Buys a Car-9.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - Learning all of the new features",
    "caption": "August 8, 2026 — Janet Buys a Car - Learning all of the new features",
    "altText": "Janet Buys a Car - Learning all of the new features",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 484
  },
  {
    "filename": "Janet Buys a Car.jpg",
    "date": "2026-08-08",
    "description": "Janet Buys a Car - She likes it!",
    "caption": "August 8, 2026 — Janet Buys a Car - She likes it!",
    "altText": "Janet Buys a Car - She likes it!",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 417
  },
  {
    "filename": "L1019979 copy.jpg",
    "date": "2026-08-17",
    "description": "L1019979 copy",
    "caption": "August 17, 2026 — L1019979 copy",
    "altText": "L1019979 copy",
    "person": [
      "Albert Everett",
      "Clay Carson",
      "Janet Carson",
      "Mark Cobard",
      "Phylis Conard",
      "Alex Brandon",
      "DSandy Covem Church Point",
      "Digby"
    ],
    "event": [],
    "width": 720,
    "height": 446
  }
];

const displayOrder: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const photographs = displayOrder.map((number) => ({
  ...photographData[number - 1],
  src: `/galleries/janet-buys-a-car/janet-buys-a-car-${String(number).padStart(2, "0")}.jpg`,
}));

const otherCollections = [
  {
    "slug": "nova-scotia",
    "title": "Nova Scotia"
  }
];

export default function JanetBuysACarPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Janet Buys a car</h1>
        <p>14 photographs</p>
      </header>
      <Gallery
        name="Janet Buys a car"
        slug="janet-buys-a-car"
        photographs={photographs}
        otherCollections={otherCollections}
        editable={process.env.NODE_ENV === "development"}
      />
    </main>
  );
}
