import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";
import { SESSION_COOKIE_NAME, getAccountForSession } from "../../../lib/private-access";
import { RequestForm } from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function ProtectedFolderPage() {
  if (!isPrivateAccessEnabled()) notFound();

  const cookieStore = await cookies();
  const account = await getAccountForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  return (
    <main className="private-access-inner">
      {account ? (
        <>
          <h1>Success!</h1>
          <p className="private-access-lede">This one was protected, and you got in, {account.name}.</p>
          <p className="private-access-lede">
            I really appreciate your help, have a great day!
            <br />
            Clay
          </p>
          <a href="/test-access" className="private-access-back">← Back</a>
        </>
      ) : (
        <>
          <h1>This folder is protected</h1>
          <p className="private-access-lede">
            Kindly fill this out and you&rsquo;ll receive an email shortly with the magic link.
          </p>
          <RequestForm />
        </>
      )}
    </main>
  );
}
