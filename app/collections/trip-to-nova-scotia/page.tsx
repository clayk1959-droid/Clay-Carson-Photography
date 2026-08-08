import { SiteHeader } from "../../SiteHeader";
import { Gallery } from "../Gallery";

type PhotographDataEntry = { filename: string; date: string | null; description: string; caption: string; altText: string; width: number; height: number };

const photographData: PhotographDataEntry[] = [];

const displayOrder: number[] = [];

const photographs = displayOrder.map((number) => ({
  ...photographData[number - 1],
  src: `/galleries/trip-to-nova-scotia/trip-to-nova-scotia-${String(number).padStart(2, "0")}.jpg`,
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
    "slug": "norway",
    "title": "Norway"
  }
];

export default function TripToNovaScotiaPage() {
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Collections</a>
        <h1>Trip to Nova Scotia</h1>
        <p>0 photographs</p>
      </header>
      <Gallery
        name="Trip to Nova Scotia"
        slug="trip-to-nova-scotia"
        photographs={photographs}
        otherCollections={otherCollections}
        editable={process.env.NODE_ENV === "development"}
      />
    </main>
  );
}
