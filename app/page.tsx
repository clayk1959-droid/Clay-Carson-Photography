import { SiteHeader } from "./SiteHeader";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <p className="hero-eyebrow">Family photos and Events</p>

      <section className="hero" id="top">
        <div
          className="hero-image"
          role="img"
          aria-label="Family walking down a wooden boardwalk toward the ocean"
        />
        <div className="hero-wash" />
      </section>
    </main>
  );
}
