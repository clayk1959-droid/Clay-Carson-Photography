import { SiteHeader } from "../SiteHeader";
import { CollectionsIndex } from "./CollectionsIndex";

const cards = [
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
    "coverBasename": "janet-buys-a-car-01.jpg",
    "coverPosition": "left center"
  },
  {
    "slug": "nova-scotia",
    "title": "Nova Scotia",
    "person": [
      "Albert Everett",
      "Alex Brandon",
      "Carol Mendal",
      "Janet Carson",
      "Karen",
      "Mark Conard",
      "Phylis Conard",
      "Phyllis Conard"
    ],
    "event": [],
    "count": 61,
    "coverBasename": "nova-scotia-11.jpg",
    "coverPosition": "center center"
  }
];
const photos = [
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-4.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Checking out window stickers",
    "altText": "Janet Buys a Car - Checking out window stickers",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 403,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-07.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-11.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Checking out window stickers",
    "altText": "Janet Buys a Car - Checking out window stickers",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 800,
    "height": 545,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-02.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-12.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Sales guy was great.  Gave her the tour",
    "altText": "Janet Buys a Car - Sales guy was great.  Gave her the tour",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 494,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-03.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-3.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - This guy is ready to make a deal.",
    "altText": "Janet Buys a Car - This guy is ready to make a deal.",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 485,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-06.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-6.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Really likes the cloth seats",
    "altText": "Janet Buys a Car - Really likes the cloth seats",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 486,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-09.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-5.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - More sales guy haggling",
    "altText": "Janet Buys a Car - More sales guy haggling",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 527,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-08.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-10.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Waiting for credit guy to sell us something.",
    "altText": "Janet Buys a Car - Waiting for credit guy to sell us something.",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 1000,
    "height": 691,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-01.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-8.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Wiil the finance guy ever finish up?",
    "altText": "Janet Buys a Car - Wiil the finance guy ever finish up?",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 467,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-11.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-7.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Done deal!",
    "altText": "Janet Buys a Car - Done deal!",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 482,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-10.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-2.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Learning all of the new features",
    "altText": "Janet Buys a Car - Learning all of the new features",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 406,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-05.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - She likes it!",
    "altText": "Janet Buys a Car - She likes it!",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 417,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-13.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-9.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Learning all of the new features",
    "altText": "Janet Buys a Car - Learning all of the new features",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 720,
    "height": 484,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-12.jpg"
  },
  {
    "collectionSlug": "janet-buys-a-car",
    "collectionTitle": "Janet Buys a car",
    "filename": "Janet Buys a Car-13.jpg",
    "caption": "August 8, 2026 — Janet Buys a Car - Proud owner",
    "altText": "Janet Buys a Car - Proud owner",
    "person": [
      "Janet Carson"
    ],
    "event": [
      "Janet buys a car"
    ],
    "width": 1000,
    "height": 687,
    "src": "/galleries/janet-buys-a-car/janet-buys-a-car-04.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1019987.jpg",
    "caption": "August 17, 2026 — Living room at Chutch Point",
    "altText": "Living room at Chutch Point",
    "person": [
      "Janet Carson",
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-01.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1019992.jpg",
    "caption": "August 17, 2026 — L1019992",
    "altText": "L1019992",
    "person": [
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-02.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1019997.jpg",
    "caption": "August 17, 2026 — Relaxing on the deck",
    "altText": "Relaxing on the deck",
    "person": [
      "Albert Everett",
      "Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-03.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020004.jpg",
    "caption": "August 17, 2026 — Exploring the yard",
    "altText": "Exploring the yard",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-04.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020029.jpg",
    "caption": "August 17, 2026 — Exploring lighthouse on the first day",
    "altText": "Exploring lighthouse on the first day",
    "person": [
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1579,
    "src": "/galleries/nova-scotia/nova-scotia-05.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020063.jpg",
    "caption": "August 17, 2026 — L1020063",
    "altText": "L1020063",
    "person": [
      "Mark Conard",
      "Albert Everett"
    ],
    "event": [],
    "width": 2200,
    "height": 1463,
    "src": "/galleries/nova-scotia/nova-scotia-07.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020078.jpg",
    "caption": "August 17, 2026 — Albert and Karen in front ot ftheir family home",
    "altText": "Albert and Karen in front ot ftheir family home",
    "person": [
      "Albert Everett",
      "Karen"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-08.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020141.jpg",
    "caption": "August 17, 2026 — Albert and Karen in front yard",
    "altText": "Albert and Karen in front yard",
    "person": [
      "Albert Everett",
      "Karen"
    ],
    "event": [],
    "width": 2200,
    "height": 1463,
    "src": "/galleries/nova-scotia/nova-scotia-12.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020158.jpg",
    "caption": "August 17, 2026 — Albert and Karen",
    "altText": "Albert and Karen",
    "person": [
      "Albert Everett",
      "Karen"
    ],
    "event": [],
    "width": 1257,
    "height": 1385,
    "src": "/galleries/nova-scotia/nova-scotia-14.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020198.jpg",
    "caption": "August 17, 2026 — Sandy Cove cemetary",
    "altText": "Sandy Cove cemetary",
    "person": [
      "Albert Everett",
      "Alex Brandon",
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-17.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020235.jpg",
    "caption": "August 17, 2026 — Sandy Cove cemetary",
    "altText": "Sandy Cove cemetary",
    "person": [
      "Albert Everett"
    ],
    "event": [],
    "width": 2200,
    "height": 1653,
    "src": "/galleries/nova-scotia/nova-scotia-18.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020302.jpg",
    "caption": "August 17, 2026 — Carol poses at sunset",
    "altText": "Carol poses at sunset",
    "person": [
      "Carol Mendal"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-22.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020361.jpg",
    "caption": "August 17, 2026 — Home base Church Point",
    "altText": "Home base Church Point",
    "person": [
      "Janet Carson",
      "Phylis Conard",
      "Carol Mendal"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-25.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020365.jpg",
    "caption": "August 17, 2026 — L1020365",
    "altText": "L1020365",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1479,
    "src": "/galleries/nova-scotia/nova-scotia-26.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020376.jpg",
    "caption": "August 17, 2026 — L1020376",
    "altText": "L1020376",
    "person": [
      "Mark Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-28.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020380.jpg",
    "caption": "August 17, 2026 — L1020380",
    "altText": "L1020380",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-29.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020395.jpg",
    "caption": "August 17, 2026 — L1020395",
    "altText": "L1020395",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-31.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020496.jpg",
    "caption": "August 17, 2026 — L1020496",
    "altText": "L1020496",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1467,
    "src": "/galleries/nova-scotia/nova-scotia-36.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020511.jpg",
    "caption": "August 17, 2026 — Lighthouse",
    "altText": "Lighthouse",
    "person": [
      "Carol Mendal",
      "Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-37.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020525.jpg",
    "caption": "August 17, 2026 — Lighthouse",
    "altText": "Lighthouse",
    "person": [
      "Carol Mendal",
      "Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1442,
    "src": "/galleries/nova-scotia/nova-scotia-39.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020539.jpg",
    "caption": "August 17, 2026 — Lighthouse",
    "altText": "Lighthouse",
    "person": [
      "Carol Mendal",
      "Janet Carson"
    ],
    "event": [],
    "width": 2200,
    "height": 1675,
    "src": "/galleries/nova-scotia/nova-scotia-40.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020595.jpg",
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
    "height": 1464,
    "src": "/galleries/nova-scotia/nova-scotia-45.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1020971.jpg",
    "caption": "August 17, 2026 — Whale watching",
    "altText": "Whale watching",
    "person": [
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1388,
    "src": "/galleries/nova-scotia/nova-scotia-51.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1021174.jpg",
    "caption": "August 17, 2026 — L1021174",
    "altText": "L1021174",
    "person": [
      "Janet Carson",
      "Phyllis Conard"
    ],
    "event": [],
    "width": 2200,
    "height": 1472,
    "src": "/galleries/nova-scotia/nova-scotia-62.jpg"
  },
  {
    "collectionSlug": "nova-scotia",
    "collectionTitle": "Nova Scotia",
    "filename": "L1021176.jpg",
    "caption": "August 17, 2026 — Bread buying decision time",
    "altText": "Bread buying decision time",
    "person": [
      "Albert Everett",
      "Alex Brandon"
    ],
    "event": [],
    "width": 2200,
    "height": 1568,
    "src": "/galleries/nova-scotia/nova-scotia-63.jpg"
  }
];

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Galleries</h1>
        <CollectionsIndex cards={cards} photos={photos} />
      </section>
    </main>
  );
}
