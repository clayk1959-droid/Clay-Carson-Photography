import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import data from "../../../data/photo-data/rhine-river-cruise.json";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: `/galleries/rhine-river-cruise/rhine-river-cruise-${String(number).padStart(2, "0")}.jpg`,
}));

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
    "slug": "norway-cruise",
    "title": "Norway Cruise"
  }
];

const collectionSubtitle: string | null = null;

export default function RhineRiverCruisePage() {
  const remote = isRemoteEditorMode();
  const photoCountText = data.displayOrder.length + " photographs";
  const subtitle = collectionSubtitle ? collectionSubtitle + " · " + photoCountText : photoCountText;
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Galleries</a>
        <h1>Rhine River Cruise</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name="Rhine River Cruise"
        slug="rhine-river-cruise"
        photographs={photographs}
        otherCollections={remote ? [] : otherCollections}
        editable={isEditorEnabled()}
        remoteMode={remote}
      />

      <SiteFooter />
    </main>
  );
}
