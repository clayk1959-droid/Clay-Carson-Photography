import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isPrivateAccessEnabled } from "../../lib/private-access-mode";
import { LoggedInBanner } from "./LoggedInBanner";

export const dynamic = "force-dynamic";

function FolderCard({ href, label, note }: { href: string; label: string; note: string }) {
  return (
    <a href={href} style={{ display: "block", padding: 20, border: "1px solid #999", textAlign: "center" }}>
      <div>{label}</div>
      <div style={{ fontSize: 13, color: "#666" }}>{note}</div>
    </a>
  );
}

export default function TestAccessLandingPage() {
  if (!isPrivateAccessEnabled()) notFound();

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>Test: Private Access</h1>
      <p>Not real photos yet -- just testing the login system. Try both folders below.</p>
      <Suspense>
        <LoggedInBanner />
      </Suspense>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FolderCard href="/test-access/open" label="Open Me First" note="Not protected" />
        <FolderCard href="/test-access/protected" label="Try Me Next" note="Protected" />
      </div>
    </main>
  );
}
