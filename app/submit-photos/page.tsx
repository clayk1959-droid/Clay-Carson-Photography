import { cookies } from "next/headers";
import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";
import { SubmitPhotosForm } from "./SubmitPhotosForm";
import { SubmitPhotosSignIn } from "./SubmitPhotosSignIn";
import { getAccountForSession, hasUploadAccess, SESSION_COOKIE_NAME } from "../../lib/private-access";

export const dynamic = "force-dynamic";

// Invite-only, same as upload access itself -- there's no request-access
// flow here, unlike a private gallery. Three states: signed in with the
// grant (show the form), signed in without it (plain "not available" --
// showing a sign-in prompt to someone already authenticated but not
// authorized would be pointless), or not signed in at all, which could
// just as easily be a brand-new invite as an expired session on this
// device -- either way, the fix is the same login-link prompt.
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
        ) : account ? (
          <div className="gallery-gate">
            <p className="gallery-gate-copy">This page isn&apos;t available.</p>
          </div>
        ) : (
          <SubmitPhotosSignIn />
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
