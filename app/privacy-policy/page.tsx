import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";

export default function PrivacyPolicyPage() {
  return (
    <main className="subpage about-page">
      <SiteHeader showHome />
      <div className="about-simple legal-simple">
        <h1 className="page-title">Privacy Policy</h1>

        <article className="about-copy legal-copy">
          <p>
            This is a private family photo site run by Clay Carson for the
            Carson &amp; Muller family. It is not a commercial product, and
            this page describes what personal information the site collects
            and how it&apos;s used.
          </p>

          <h2>What we collect</h2>
          <p>
            If you request access to a private gallery, we collect the name
            and email address you provide, so the request can be reviewed
            and a login link sent once approved. If you submit photos
            through the Submit Photos page, we collect your name, email
            address, and the photos themselves. We don&apos;t collect
            anything beyond what you directly provide through these forms.
          </p>

          <h2>How we use it</h2>
          <p>
            Your name and email are used only to process your request or
            submission — approving gallery access, sending you a login
            link, or following up about photos you&apos;ve submitted.
            Submitted photos are reviewed by Clay before anything is added
            to the site; nothing you submit is published automatically.
          </p>

          <h2>Text message alerts</h2>
          <p>
            The site sends text message alerts to notify the site owner
            (Clay) when someone requests gallery access, submits photos, or
            when a technical problem occurs. Only the site owner&apos;s own
            phone number is enrolled in these alerts — visitors and family
            members are never asked for a phone number on this site, and no
            one else&apos;s number is ever added to this program. We do not
            share, sell, or provide your mobile phone number or messaging
            consent data to third parties or affiliates for marketing or
            promotional purposes.
          </p>

          <h2>Sharing your information</h2>
          <p>
            We do not sell, rent, or share your personal information with
            third parties for marketing purposes. Your information passes
            through the service providers that run the site&apos;s basic
            infrastructure — hosting, the database, and outgoing email —
            solely to make the site function, and for no other purpose.
          </p>

          <h2>Your choices</h2>
          <p>
            If you&apos;d like your information removed or have any
            questions about this policy, email{" "}
            <a href="mailto:clayk1959@gmail.com">clayk1959@gmail.com</a>.
          </p>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
