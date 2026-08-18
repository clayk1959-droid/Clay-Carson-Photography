import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";

function SentenceSpace() {
  return <span className="sentence-gap">{"\u00A0"}</span>;
}

export default function AboutPage() {
  return (
    <main className="subpage about-page">
      <SiteHeader showHome />
      <div className="about-simple">
        <h1 className="page-title">About this site</h1>

        <article className="about-copy">
          <p>
            This is our family&apos;s photo site.<SentenceSpace />I&apos;m
            Clay — I have a wonderful family: my wife, Janet; son Kyle;
            daughter Katie and her husband, Benjamin; and their son,
            Christian Ryan Muller—the center of our universe.
          </p>
          <p>
            I&apos;ve spent my life around photography, and now I get to
            point that toward what matters most: keeping our family&apos;s
            photos organized and easy for everyone to enjoy, from reunions
            and holidays to everyday moments.
          </p>
          <p>Enjoy!</p>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
