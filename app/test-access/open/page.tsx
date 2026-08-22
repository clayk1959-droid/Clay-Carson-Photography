import { notFound } from "next/navigation";
import { isPrivateAccessEnabled } from "../../../lib/private-access-mode";

export const dynamic = "force-dynamic";

export default function OpenFolderPage() {
  if (!isPrivateAccessEnabled()) notFound();

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>Success!</h1>
      <p>This one wasn&rsquo;t protected -- anyone can see it.</p>
      <a href="/test-access">← Back</a>
    </main>
  );
}
