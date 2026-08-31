"use client";

import { useEffect, useState } from "react";
import { clearPendingEdits, usePendingEdits } from "./pendingEdits";

// Remote-mode equivalent of the local "Sync Gallery" button -- shown on
// both the Galleries index (pin/privacy edits) and each gallery page
// (photo edits, reorder, cover), reading from the same shared localStorage
// queue either way, so a pending edit staged on one page is still there
// (and still counted) if you sync from the other.
export function EditorSyncBar() {
  const edits = usePendingEdits();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (edits.length === 0) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [edits.length]);

  useEffect(() => {
    if (status !== "done" && status !== "error") return;
    const timeout = setTimeout(() => setStatus("idle"), 20000);
    return () => clearTimeout(timeout);
  }, [status]);

  if (edits.length === 0 && status === "idle") return null;

  async function handleSync() {
    setStatus("syncing");
    setMessage("");
    try {
      const response = await fetch("/api/editor-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.ok) throw new Error(body?.error || "Sync failed.");
      const count = edits.length;
      clearPendingEdits();
      setStatus("done");
      setMessage(`Synced ${count} change${count === 1 ? "" : "s"} — live on the site within a minute or two.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Sync failed.");
    }
  }

  return (
    <div className="sync-gallery">
      <button
        type="button"
        className="sync-gallery-button"
        disabled={status === "syncing" || edits.length === 0}
        onClick={handleSync}
      >
        {status === "syncing"
          ? "Syncing…"
          : edits.length > 0
            ? `Sync ${edits.length} change${edits.length === 1 ? "" : "s"}`
            : "Sync"}
      </button>
      {(status === "done" || status === "error") && (
        <div className={status === "error" ? "sync-gallery-status is-error" : "sync-gallery-status"}>
          <button
            type="button"
            className="sync-gallery-status-close"
            onClick={() => setStatus("idle")}
            aria-label="Close sync results"
          >
            ×
          </button>
          <pre>{message}</pre>
        </div>
      )}
    </div>
  );
}
