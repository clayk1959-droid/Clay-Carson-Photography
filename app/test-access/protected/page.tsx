import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, getAccountForSession, notifyOwnerOnce } from "../../../lib/private-access";
import { RequestForm } from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function ProtectedFolderPage() {
  if (!isPrivateAccessEnabled()) notFound();

  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (account) {
    await notifyOwnerOnce(account.session_id, account.notified_at, account.name, account.email);
  }

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      {account ? (
        <>
          <h1>Success!</h1>
          <p>
            This one was protected, and you got in, {account.name}. Clay just got an email about it.
          </p>
          <a href="/test-access">← Back</a>
        </>
      ) : (
        <>
          <h1>This folder is protected</h1>
          <p>Kindly fill this out and you&rsquo;ll receive an email shortly with the magic link.</p>
          <RequestForm />
        </>
      )}
    </main>
  );
}
