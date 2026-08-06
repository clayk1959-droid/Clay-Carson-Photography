import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

const photographData = [
  {
    "caption": "August 24, 2025 — Sunshine is his friend.",
    "altText": "Sunshine is his friend.",
    "width": 1469,
    "height": 2200
  },
  {
    "caption": "January 29, 2026 — Messy but enthusiastic.",
    "altText": "Messy but enthusiastic.",
    "width": 2200,
    "height": 1786
  },
  {
    "caption": "August 20, 2025 — Waits with Grandma for first haircut.",
    "altText": "Waits with Grandma for first haircut.",
    "width": 2200,
    "height": 1563
  },
  {
    "caption": "June 27, 2026 — Walking the stacks.",
    "altText": "Walking the stacks.",
    "width": 2200,
    "height": 1320
  },
  {
    "caption": "April 26, 2026 — An empty box is an adventure.",
    "altText": "An empty box is an adventure.",
    "width": 2200,
    "height": 1950
  },
  {
    "caption": "March 22, 2026 — Serious about his cooking.",
    "altText": "Serious about his cooking.",
    "width": 2092,
    "height": 2200
  },
  {
    "caption": "March 23, 2026 — Practicing for Guy’s Grocery Games.",
    "altText": "Practicing for Guy’s Grocery Games.",
    "width": 2200,
    "height": 2142
  },
  {
    "caption": "March 29, 2026 — So much to explore.",
    "altText": "So much to explore.",
    "width": 2200,
    "height": 1627
  },
  {
    "caption": "April 4, 2026 — First bouncy house at church Easter egg hunt.",
    "altText": "First bouncy house at church Easter egg hunt.",
    "width": 2200,
    "height": 1737
  },
  {
    "caption": "June 28, 2026 — Content and safe.",
    "altText": "Content and safe.",
    "width": 2200,
    "height": 1464
  },
  {
    "caption": "September 27, 2024 — I have no words as of this writing.",
    "altText": "I have no words as of this writing.",
    "width": 2200,
    "height": 1850
  },
  {
    "caption": "May 1, 2025 — Mama’s love.",
    "altText": "Mama’s love.",
    "width": 2200,
    "height": 2126
  },
  {
    "caption": "August 3, 2024 — Kyle so loved that boy.",
    "altText": "Kyle so loved that boy.",
    "width": 1517,
    "height": 2200
  },
  {
    "caption": "June 13, 2026 — Playing on living room floor and ready to go on a new adventure.",
    "altText": "Playing on living room floor and ready to go on a new adventure.",
    "width": 2200,
    "height": 1739
  },
  {
    "caption": "June 13, 2026 — First swimming lesson.",
    "altText": "First swimming lesson.",
    "width": 2200,
    "height": 1380
  },
  {
    "caption": "September 17, 2025 — But sometimes he was not happy with Kyle.",
    "altText": "But sometimes he was not happy with Kyle.",
    "width": 2200,
    "height": 1700
  }
];

const photographs = photographData.map((photograph, index) => ({
  ...photograph,
  src: `/galleries/christian/christian-${String(index + 1).padStart(2, "0")}.jpg`,
}));

export default function ChristianPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Christian</h1>
        <p>16 photographs</p>
      </header>
      <Gallery name="Christian" photographs={photographs} />
    </main>
  );
}
