import { cookies } from "next/headers";
import { SiteHeader } from "../../SiteHeader";
import { SiteFooter } from "../../SiteFooter";
import { Gallery } from "../Gallery";
import { GalleryAccessGate } from "../GalleryAccessGate";
import { isEditorEnabled, isRemoteEditorMode } from "../../../lib/editor-mode";
import { getAccountForSession, hasGalleryAccess, SESSION_COOKIE_NAME } from "../../../lib/private-access";
import data from "../../../data/photo-data/nova-scotia.json";

export const dynamic = "force-dynamic";

const photographs = data.displayOrder.map((number) => ({
  ...data.photographData[number - 1],
  src: `/api/private-photo/galleries/nova-scotia/nova-scotia-${String(number).padStart(2, "0")}.jpg`,
}));

const hiddenPhotographs = data.photographData
  .map((photo, index) => ({
    ...photo,
    src: `/api/private-photo/galleries/nova-scotia/nova-scotia-${String(index + 1).padStart(2, "0")}.jpg`,
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
  }
];

const collectionSubtitle: string | null = null;

export default async function NovaScotiaPage() {
  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const authorized = account ? await hasGalleryAccess(account.account_id, "nova-scotia") : false;

  if (!authorized) {
    return (
      <main className="subpage collection-page">
        <SiteHeader showHome />
        <header className="collection-heading">
          <a href="/collections">← Galleries</a>
          <h1>Nova Scotia</h1>
        </header>
        <GalleryAccessGate gallerySlug="nova-scotia" />
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
        <h1>Nova Scotia</h1>
        <p>{subtitle}</p>
      </header>
      <Gallery
        name="Nova Scotia"
        slug="nova-scotia"
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
