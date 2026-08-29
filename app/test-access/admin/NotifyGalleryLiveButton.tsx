"use client";

import { useState } from "react";

export function NotifyGalleryLiveButton({ accountId }: { accountId: number }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function send() {
    if (!confirm("Send this person an email saying their gallery is live?")) return;
    setStatus("sending");
    try {
      await fetch("/api/test-access/notify-gallery-live", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      className="private-access-pill-btn"
      disabled={status !== "idle"}
      onClick={send}
      title="Email this person their submitted photos have been built into a gallery"
    >
      {status === "sending" ? "…" : status === "sent" ? "Sent" : "Gallery live"}
    </button>
  );
}
