import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import data from "../../../data/photo-data/janet-buys-a-car.json";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: `/galleries/janet-buys-a-car/janet-buys-a-car-${String(number).padStart(2, "0")}.jpg`,
}));

const hiddenPhotographs = data.photographData
  .map((photo, index) => ({
    ...photo,
    src: `/galleries/janet-buys-a-car/janet-buys-a-car-${String(index + 1).padStart(2, "0")}.jpg`,
  }))
  .filter((photo) => photo.hidden);

const otherCollections = [
  {
    "slug": "norway-cruise",
    "title": "Norway Cruise"
  },
  {
    "slug": "rhine-river-cruise",
    "title": "Rhine River Cruise"
  },
  {
    "slug": "blue-yoga-nyla",
    "title": "Blue Yoga Nyla"
  },
  {
    "slug": "kyle",
    "title": "Kyle"
  },
  {
    "slug": "nova-scotia",
    "title": "Nova Scotia"
  },
  {
    "slug": "christian-janet-read",
    "title": "Christian & Janet Read"
  },
  {
    "slug": "christian-2nd-year",
    "title": "Christian 2nd Year"
  },
  {
    "slug": "flying",
    "title": "Flying"
  }
];

const collectionSubtitle: string | null = null;

export default function JanetBuysACarPage() {
  const remote = isRemoteEditorMode();
  const photoCountText = data.displayOrder.length + " Photos";
  const subtitle = collectionSubtitle ? collectionSubtitle + " · " + photoCountText : photoCountText;
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Galleries</a>
        <h1>Janet Buys a car</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name="Janet Buys a car"
        slug="janet-buys-a-car"
        photographs={photographs}
        hiddenPhotographs={hiddenPhotographs}
        otherCollections={remote ? [] : otherCollections}
        editable={isEditorEnabled()}
        remoteMode={remote}
      />

      <SiteFooter />
    </main>
  );
}
