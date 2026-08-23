"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RevokeButton({ id, revoked }: { id: number; revoked: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    try {
      await fetch("/api/test-access/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, revoke: !revoked }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`private-access-pill-btn ${revoked ? "restore" : "revoke"}`}
    >
      {busy ? "…" : revoked ? "Restore" : "Revoke"}
    </button>
  );
}
