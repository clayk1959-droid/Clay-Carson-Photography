import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import data from "../../../data/photo-data/norway-cruise.json";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: `/galleries/norway-cruise/norway-cruise-${String(number).padStart(2, "0")}.jpg`,
}));

const hiddenPhotographs = data.photographData
  .map((photo, index) => ({
    ...photo,
    src: `/galleries/norway-cruise/norway-cruise-${String(index + 1).padStart(2, "0")}.jpg`,
  }))
  .filter((photo) => photo.hidden);

const otherCollections = [
  {
    "slug": "janet-buys-a-car",
    "title": "Janet Buys a car"
  },
  {
    "slug": "nova-scotia",
    "title": "Nova Scotia"
  },
  {
    "slug": "rhine-river-cruise",
    "title": "Rhine River Cruise"
  },
  {
    "slug": "katie-ben-s-wedding",
    "title": "Katie & Ben's Wedding"
  },
  {
    "slug": "france-trip",
    "title": "France trip"
  },
  {
    "slug": "blue-yoga-nyla",
    "title": "Blue Yoga Nyla"
  },
  {
    "slug": "submit-test",
    "title": "Submit Test"
  }
];

const collectionSubtitle: string | null = null;

export default function NorwayCruisePage() {
  const remote = isRemoteEditorMode();
  const photoCountText = data.displayOrder.length + " Photos";
  const subtitle = collectionSubtitle ? collectionSubtitle + " · " + photoCountText : photoCountText;
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Galleries</a>
        <h1>Norway Cruise</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name="Norway Cruise"
        slug="norway-cruise"
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
