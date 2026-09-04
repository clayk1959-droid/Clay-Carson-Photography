import { cookies } from "next/headers";
import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { GalleryAccessGate } from "../GalleryAccessGate";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import { getAccountForSession, hasGalleryAccess, SESSION_COOKIE_NAME } from "../../../lib/private-access";
import data from "../../../data/photo-data/christian-janet-read.json";

export const dynamic = "force-dynamic";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: `/api/private-photo/galleries/christian-janet-read/christian-janet-read-${String(number).padStart(2, "0")}.jpg`,
}));

const hiddenPhotographs = data.photographData
  .map((photo, index) => ({
    ...photo,
    src: `/api/private-photo/galleries/christian-janet-read/christian-janet-read-${String(index + 1).padStart(2, "0")}.jpg`,
  }))
  .filter((photo) => photo.hidden);

const otherCollections = [
  {
    "slug": "janet-buys-a-car",
    "title": "Janet Buys a car"
  },
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
    "slug": "christian-2nd-year",
    "title": "Christian 2nd Year"
  },
  {
    "slug": "flying",
    "title": "Flying"
  }
];

const collectionSubtitle: string | null = null;

export default async function ChristianJanetReadPage() {
  // The editor (local dev, or the password-gated remote-editor deployment)
  // always sees every gallery, private or not, for editing -- the family
  // access grant is a visitor concept, not something that should also gate
  // the person managing privacy in the first place.
  const editorEnabled = isEditorEnabled();
  let authorized = editorEnabled;
  if (!authorized) {
    const cookieStore = await cookies();
    const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    authorized = account ? await hasGalleryAccess(account.account_id, "christian-janet-read") : false;
  }

  if (!authorized) {
    return (
      <main className="subpage collection-page">
        <SiteHeader showHome />
        <header className="collection-heading">
          <a href="/collections">← Galleries</a>
          <h1>Christian & Janet Read</h1>
        </header>
        <GalleryAccessGate gallerySlug="christian-janet-read" />
        <SiteFooter />
      </main>
    );
  }

  const remote = isRemoteEditorMode();
  const photoCountText = data.displayOrder.length + " Photos";
  const subtitle = collectionSubtitle ? collectionSubtitle + " · " + photoCountText : photoCountText;
  return (
    <main className="subpage collection-page">
      <SiteHeader showHome />
      <header className="collection-heading">
        <a href="/collections">← Galleries</a>
        <h1>Christian & Janet Read</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name="Christian & Janet Read"
        slug="christian-janet-read"
        photographs={photographs}
        hiddenPhotographs={hiddenPhotographs}
        otherCollections={remote ? [] : otherCollections}
        editable={editorEnabled}
        remoteMode={remote}
      />

      <SiteFooter />
    </main>
  );
}
