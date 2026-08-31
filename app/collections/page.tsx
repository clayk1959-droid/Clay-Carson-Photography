import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { CollectionsIndex } from "./CollectionsIndex";
import { SubmitPhotosLink } from "./SubmitPhotosLink";
import { isEditorEnabled, isRemoteEditorMode } from "../../lib/editor-mode";
import indexData from "../../data/photo-data/_index.json";

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <div className="collections-title-row">
          <h1 className="page-title">Galleries</h1>
          <SubmitPhotosLink />
        </div>
        <CollectionsIndex
          cards={indexData.cards}
          photos={indexData.photos}
          editable={isEditorEnabled()}
          remoteMode={isRemoteEditorMode()}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
