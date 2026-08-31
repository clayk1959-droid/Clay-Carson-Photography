import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";

export default function TermsPage() {
  return (
    <main className="subpage about-page">
      <SiteHeader showHome />
      <div className="about-simple legal-simple">
        <h1 className="page-title">Terms &amp; Conditions</h1>

        <article className="about-copy legal-copy">
          <p>
            This is a private family photo site run by Clay Carson for the
            Carson &amp; Muller family, not a commercial product. By using
            it — requesting gallery access, submitting photos, or otherwise
            — you agree to the terms below.
          </p>

          <h2>SMS Alerts Program</h2>
          <p>
            The site owner (Clay) receives text message alerts for three
            events: someone requesting access to a private gallery, someone
            submitting photos, and a technical deploy failure. Only the site
            owner&apos;s own phone number is enrolled in this program —
            no visitor or family member&apos;s phone number is ever
            collected or enrolled, and consent to this program applies only
            to that one number, not bundled into any other agreement.
          </p>
          <p>
            Message frequency varies with site activity — typically a
            handful of messages a month or fewer. Message and data rates
            may apply. Reply STOP to the number sending these alerts to
            unsubscribe, or HELP for help. We do not share, sell, or
            provide phone numbers or messaging consent data collected
            through this program to third parties or affiliates for
            marketing or promotional purposes.
          </p>

          <h2>Site content</h2>
          <p>
            Photos on this site belong to the Carson &amp; Muller family.
            Access to any private gallery is granted at Clay&apos;s
            discretion and can be revoked at any time. Photos you submit
            through the Submit Photos page are reviewed before anything is
            published — submitting a photo doesn&apos;t guarantee it will
            appear on the site.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href="mailto:clayk1959@gmail.com">clayk1959@gmail.com</a>.
          </p>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
