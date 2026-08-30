import { cookies } from "next/headers";
import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { GalleryAccessGate } from "../GalleryAccessGate";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import { getAccountForSession, hasGalleryAccess, SESSION_COOKIE_NAME } from "../../../lib/private-access";
import data from "../../../data/photo-data/blue-yoga-nyla.json";

export const dynamic = "force-dynamic";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: `/api/private-photo/galleries/blue-yoga-nyla/blue-yoga-nyla-${String(number).padStart(2, "0")}.jpg`,
}));

const hiddenPhotographs = data.photographData
  .map((photo, index) => ({
    ...photo,
    src: `/api/private-photo/galleries/blue-yoga-nyla/blue-yoga-nyla-${String(index + 1).padStart(2, "0")}.jpg`,
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
    "slug": "norway-cruise",
    "title": "Norway Cruise"
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
    "slug": "submit-test",
    "title": "Submit Test"
  }
];

const collectionSubtitle: string | null = null;

export default async function BlueYogaNylaPage() {
  // The editor (local dev, or the password-gated remote-editor deployment)
  // always sees every gallery, private or not, for editing -- the family
  // access grant is a visitor concept, not something that should also gate
  // the person managing privacy in the first place.
  const editorEnabled = isEditorEnabled();
  let authorized = editorEnabled;
  if (!authorized) {
    const cookieStore = await cookies();
    const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    authorized = account ? await hasGalleryAccess(account.account_id, "blue-yoga-nyla") : false;
  }

  if (!authorized) {
    return (
      <main className="subpage collection-page">
        <SiteHeader showHome />
        <header className="collection-heading">
          <a href="/collections">← Galleries</a>
          <h1>Blue Yoga Nyla</h1>
        </header>
        <GalleryAccessGate gallerySlug="blue-yoga-nyla" />
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
        <h1>Blue Yoga Nyla</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name="Blue Yoga Nyla"
        slug="blue-yoga-nyla"
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
