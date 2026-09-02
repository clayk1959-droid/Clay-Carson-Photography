import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { SmsAlertsForm } from "./SmsAlertsForm";

// Deliberately public, no login required -- this is the real opt-in
// mechanism carrier A2P review needs to be able to visit and verify. In
// practice only Clay (the site owner) has any reason to use it, but the
// page and the confirm-by-code flow behind it are fully real either way.
export default function SmsAlertsPage() {
  return (
    <main className="subpage submit-photos-page">
      <SiteHeader showHome />
      <section className="submit-photos-layout">
        <SmsAlertsForm />
      </section>
      <SiteFooter />
    </main>
  );
}
