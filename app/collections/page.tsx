import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { CollectionsIndex } from "./CollectionsIndex";
import { isEditorEnabled } from "../../lib/editor-mode";
import indexData from "../../data/photo-data/_index.json";

export default function CollectionsPage() {
  return (
    <main className="subpage collections-page">
      <SiteHeader showHome />
      <section className="collections-layout">
        <h1 className="page-title">Galleries</h1>
        <CollectionsIndex cards={indexData.cards} photos={indexData.photos} editable={isEditorEnabled()} />
      </section>

      <SiteFooter />
    </main>
  );
}
