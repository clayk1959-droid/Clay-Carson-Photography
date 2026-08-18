import { SiteHeader } from "./SiteHeader";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div
          className="hero-image"
          role="img"
          aria-label="Family walking down a wooden boardwalk toward the ocean"
        />
        <div className="hero-wash" />
        <div className="hero-copy">
          <p className="eyebrow">Family photos, all in one place</p>
        </div>
      </section>
    </main>
  );
}
