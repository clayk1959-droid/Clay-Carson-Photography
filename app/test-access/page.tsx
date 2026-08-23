import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isPrivateAccessEnabled } from "../../lib/private-access-mode";
import { LoggedInBanner } from "./LoggedInBanner";

export const dynamic = "force-dynamic";

function FolderIcon({ locked }: { locked?: boolean }) {
  return (
    <svg viewBox="0 0 64 52" className="private-access-folder-icon" aria-hidden="true">
      <path
        d="M4 10a4 4 0 0 1 4-4h14l6 6h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10Z"
        fill="currentColor"
        opacity=".08"
      />
      <path
        d="M4 10a4 4 0 0 1 4-4h14l6 6h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {locked && (
        <g transform="translate(44, 28)">
          <circle r="11" fill="var(--paper)" stroke="currentColor" strokeWidth="2" />
          <rect x="-4.5" y="-1" width="9" height="7" rx="1.5" fill="currentColor" />
          <path d="M-3 -1v-2.5a3 3 0 0 1 6 0V-1" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </g>
      )}
    </svg>
  );
}

function FolderCard({ href, label, locked }: { href: string; label: string; locked?: boolean }) {
  return (
    <a href={href} className="private-access-card">
      <FolderIcon locked={locked} />
      <div className="private-access-card-label">{label}</div>
    </a>
  );
}

export default function TestAccessLandingPage() {
  if (!isPrivateAccessEnabled()) notFound();

  return (
    <main className="private-access-inner">
      <h1>Private Access Test</h1>
      <p className="private-access-lede">
        Thanks for helping me try out a way to secure folders online, but still make it fairly
        easy to grant access on request. Nothing happens here. The folders are empty — this just
        checks that my process works, hopefully smoothly.
      </p>
      <p className="private-access-lede">
        Please click on Try Me First. Then click on Try Me Second and follow the workflow. Your
        time is very much appreciated.
      </p>
      <p className="private-access-signoff">Clay</p>
      <Suspense>
        <LoggedInBanner />
      </Suspense>
      <div className="private-access-cards">
        <FolderCard href="/test-access/open" label="Try Me First" />
        <FolderCard href="/test-access/protected" label="Try Me Second" locked />
      </div>
    </main>
  );
}
