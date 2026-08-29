"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadAccessToggle({ accountId, granted }: { accountId: number; granted: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    try {
      await fetch("/api/test-access/upload-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountId, grant: !granted }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="upload-access-toggle">
      <input type="checkbox" checked={granted} disabled={busy} onChange={toggle} />
    </label>
  );
}
