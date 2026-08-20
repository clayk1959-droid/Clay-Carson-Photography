import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { RotatingHero } from "./RotatingHero";
import { getHomepagePhotos } from "../lib/homepage-photos";

export default function Home() {
  const { desktop, mobile } = getHomepagePhotos();

  return (
    <main>
      <SiteHeader tagline="Family photos and Events" />

      <section className="hero" id="top">
        <RotatingHero desktopPhotos={desktop} mobilePhotos={mobile} />
        <div className="hero-wash" />

        <div className="hero-copy">
          <p className="hero-eyebrow">Family &amp; Event Photography</p>
          <h1 className="hero-headline">
            Little moments,
            <br />
            held a little longer.
          </h1>
          <a className="hero-cta" href="/collections">
            Start Looking
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
