"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = { id: number; name: string; email: string };
type Gallery = { slug: string; title: string };

async function setAccess(accountId: number, gallerySlug: string, grant: boolean) {
  await fetch("/api/test-access/gallery-access", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountId, gallerySlug, grant }),
  });
}

// The DB-admin checkbox matrix Clay asked for: one row per account, one
// column per collection currently flagged private in the editor. Toggling a
// cell writes directly to gallery_access -- the same table the real
// request → approve email flow on the main site grants into.
export function GalleryAccessGrid({
  accounts,
  privateGalleries,
  grants,
}: {
  accounts: Account[];
  privateGalleries: Gallery[];
  grants: Set<string>;
}) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function toggleCell(accountId: number, gallerySlug: string, currentlyGranted: boolean) {
    const key = `${accountId}:${gallerySlug}`;
    setBusyKey(key);
    try {
      await setAccess(accountId, gallerySlug, !currentlyGranted);
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  async function grantAll(gallerySlug: string) {
    setBusyKey(`all:${gallerySlug}`);
    try {
      await Promise.all(
        accounts
          .filter((account) => !grants.has(`${account.id}:${gallerySlug}`))
          .map((account) => setAccess(account.id, gallerySlug, true)),
      );
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  if (privateGalleries.length === 0) {
    return <p className="private-access-note">No galleries are marked private right now.</p>;
  }
  if (accounts.length === 0) {
    return <p className="private-access-note">No accounts yet to grant access to.</p>;
  }

  return (
    <div className="private-access-table-wrap">
      <table className="private-access-table gallery-access-grid">
        <thead>
          <tr>
            <th>Account</th>
            {privateGalleries.map((gallery) => (
              <th key={gallery.slug}>
                <div className="gallery-access-column-head">
                  <span>{gallery.title}</span>
                  <button
                    type="button"
                    className="private-access-pill-btn"
                    disabled={busyKey === `all:${gallery.slug}`}
                    onClick={() => grantAll(gallery.slug)}
                  >
                    {busyKey === `all:${gallery.slug}` ? "…" : "Grant all"}
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>
                {account.name}
                <br />
                <span className="private-access-note">{account.email}</span>
              </td>
              {privateGalleries.map((gallery) => {
                const key = `${account.id}:${gallery.slug}`;
                const granted = grants.has(key);
                return (
                  <td key={gallery.slug} className="gallery-access-cell">
                    <input
                      type="checkbox"
                      checked={granted}
                      disabled={busyKey === key}
                      onChange={() => toggleCell(account.id, gallery.slug, granted)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
