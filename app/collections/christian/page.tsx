import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

type PhotographDataEntry = { filename: string; date: string | null; description: string; caption: string; altText: string; person: string[]; event: string[]; width: number; height: number };

const photographData: PhotographDataEntry[] = [
  {
    "filename": "Christian at door GOOD LIGHT_1.tif",
    "date": "2025-08-24",
    "description": "Sunshine is his friend.",
    "caption": "August 24, 2025 — Sunshine is his friend.",
    "altText": "Sunshine is his friend.",
    "person": [],
    "event": [],
    "width": 1469,
    "height": 2200
  },
  {
    "filename": "Christian eating with spoon_10.tif",
    "date": "2026-01-29",
    "description": "Messy but enthusiastic eater",
    "caption": "January 29, 2026 — Messy but enthusiastic eater",
    "altText": "Messy but enthusiastic eater",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1786
  },
  {
    "filename": "Christian haircut_4.tif",
    "date": "2025-08-20",
    "description": "Waits with Grandma for first haircut.",
    "caption": "August 20, 2025 — Waits with Grandma for first haircut.",
    "altText": "Waits with Grandma for first haircut.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1563
  },
  {
    "filename": "Christian in book stacks.jpg",
    "date": "2026-06-27",
    "description": "Walking the stacks.",
    "caption": "June 27, 2026 — Walking the stacks.",
    "altText": "Walking the stacks.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1320
  },
  {
    "filename": "Christian laughs comking out of Box.jpg",
    "date": "2026-04-26",
    "description": "An empty box is an adventure.",
    "caption": "April 26, 2026 — An empty box is an adventure.",
    "altText": "An empty box is an adventure.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1950
  },
  {
    "filename": "Christian plays with kitchen.tif",
    "date": "2026-03-22",
    "description": "Serious about his cooking.",
    "caption": "March 22, 2026 — Serious about his cooking.",
    "altText": "Serious about his cooking.",
    "person": [],
    "event": [],
    "width": 2092,
    "height": 2200
  },
  {
    "filename": "Christian rubs with cart.tif",
    "date": "2026-03-23",
    "description": "Practicing for Guy’s Grocery Games.",
    "caption": "March 23, 2026 — Practicing for Guy’s Grocery Games.",
    "altText": "Practicing for Guy’s Grocery Games.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 2142
  },
  {
    "filename": "Christian runs front yard into sun.jpg",
    "date": "2026-03-29",
    "description": "So much to explore.",
    "caption": "March 29, 2026 — So much to explore.",
    "altText": "So much to explore.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1627
  },
  {
    "filename": "Christian smiles in Bounce house.jpg",
    "date": "2026-04-04",
    "description": "First bouncy house at church Easter egg hunt.",
    "caption": "April 4, 2026 — First bouncy house at church Easter egg hunt.",
    "altText": "First bouncy house at church Easter egg hunt.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1737
  },
  {
    "filename": "Grandma is home!.jpg",
    "date": "2026-06-28",
    "description": "Content and safe.",
    "caption": "June 28, 2026 — Content and safe.",
    "altText": "Content and safe.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1464
  },
  {
    "filename": "Janet, Kyle, Christian.tif",
    "date": "2024-09-27",
    "description": "Happy Days",
    "caption": "September 27, 2024 — Happy Days",
    "altText": "Happy Days",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1850
  },
  {
    "filename": "Katie & Christian on floor.tif",
    "date": "2025-05-01",
    "description": "Mama’s love.",
    "caption": "May 1, 2025 — Mama’s love.",
    "altText": "Mama’s love.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 2126
  },
  {
    "filename": "Kyle and Christian-Good.jpeg",
    "date": "2024-08-03",
    "description": "Kyle so loved that boy.",
    "caption": "August 3, 2024 — Kyle so loved that boy.",
    "altText": "Kyle so loved that boy.",
    "person": [],
    "event": [],
    "width": 1517,
    "height": 2200
  },
  {
    "filename": "Sits on floor looks behind smiles GOOD.jpg",
    "date": "2026-06-13",
    "description": "Playing on living room floor and ready to go on a new adventure.",
    "caption": "June 13, 2026 — Playing on living room floor and ready to go on a new adventure.",
    "altText": "Playing on living room floor and ready to go on a new adventure.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1739
  },
  {
    "filename": "hristian laughs and splashes.jpg",
    "date": "2026-06-13",
    "description": "First swimming lesson.",
    "caption": "June 13, 2026 — First swimming lesson.",
    "altText": "First swimming lesson.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1380
  },
  {
    "filename": "reading crying.jpg",
    "date": "2025-09-17",
    "description": "But sometimes he was not happy with Kyle.",
    "caption": "September 17, 2025 — But sometimes he was not happy with Kyle.",
    "altText": "But sometimes he was not happy with Kyle.",
    "person": [],
    "event": [],
    "width": 2200,
    "height": 1700
  }
];

const displayOrder: number[] = [3, 1, 4, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const photographs = displayOrder.map((number) => ({
  ...photographData[number - 1],
  src: `/galleries/christian/christian-${String(number).padStart(2, "0")}.jpg`,
}));

const otherCollections = [
  {
    "slug": "gulf-shores-2025",
    "title": "Gulf Shores 2025"
  },
  {
    "slug": "norway",
    "title": "Norway"
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

export default function ChristianPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Christian</h1>
        <p>16 photographs</p>
      </header>
      <Gallery
        name="Christian"
        slug="christian"
        photographs={photographs}
        otherCollections={otherCollections}
        editable={process.env.NODE_ENV === "development"}
      />
    </main>
  );
}
