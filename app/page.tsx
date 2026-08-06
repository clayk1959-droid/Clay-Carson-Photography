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
          <p className="eyebrow">Stories in natural light · Since 1979</p>
          <h1 className="hero-title">Light is our only tool</h1>
          <p className="intro">
            Family, travel and random
            <br />
            stuff, taken close to the heart
          </p>
        </div>
      </section>
    </main>
  );
}
