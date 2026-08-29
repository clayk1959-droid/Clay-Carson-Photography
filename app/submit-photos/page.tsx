import { cookies } from "next/headers";
import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { SubmitPhotosForm } from "./SubmitPhotosForm";
import { getAccountForSession, hasUploadAccess, SESSION_COOKIE_NAME } from "../../lib/private-access";

export const dynamic = "force-dynamic";

// Invite-only, same as upload access itself -- there's no request-access
// flow here, unlike a private gallery. Someone without the grant just sees
// a plain "not available" message, matching Clay's explicit choice not to
// offer a self-serve way to ask for this ability.
export default async function SubmitPhotosPage() {
  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const authorized = account ? await hasUploadAccess(account.account_id) : false;

  return (
    <main className="subpage submit-photos-page">
      <SiteHeader showHome />
      <section className="submit-photos-layout">
        {authorized && account ? (
          <SubmitPhotosForm name={account.name} />
        ) : (
          <div className="gallery-gate">
            <p className="gallery-gate-copy">This page isn&apos;t available.</p>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
