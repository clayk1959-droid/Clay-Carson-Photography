import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export default function Home() {
  return (
    <main>
      <SiteHeader tagline="Family photos and Events" />

      <section className="hero" id="top">
        <div className="hero-frame">
          <div
            className="hero-image"
            role="img"
            aria-label="Family walking down a wooden boardwalk toward the ocean"
          />
          <div className="hero-wash" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
