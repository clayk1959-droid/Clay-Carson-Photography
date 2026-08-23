import { notFound } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export default function OpenFolderPage() {
  if (!isPrivateAccessEnabled()) notFound();

  return (
    <main className="private-access-inner">
      <h1>Success!</h1>
      <p className="private-access-lede">This one wasn&rsquo;t protected — anyone can see it.</p>
      <p className="private-access-lede">
        Please click on the Back button and click on Try Me Second.
      </p>
      <a href="/test-access" className="private-access-back">← Back</a>
    </main>
  );
}
