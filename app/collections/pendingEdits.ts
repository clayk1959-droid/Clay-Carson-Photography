"use client";

import { useEffect, useState } from "react";
import type { PendingEdit } from "../../lib/remote-editor";

export type { PendingEdit };

// Remote-mode edits are staged here (not committed) until an explicit Sync,
// so several actions fired in quick succession can't race each other's
// GitHub commits -- see lib/remote-editor.ts's applyBatchRemote for the
// other half of this. localStorage (not sessionStorage or React state) on
// purpose: it survives a page navigation between the Galleries index and a
// gallery page, a refresh, and even closing the tab, so a staged batch of
// edits isn't lost just because you didn't click Sync before stepping away.
const STORAGE_KEY = "editor-pending-edits";
const CHANGE_EVENT = "editor-pending-edits-changed";

function readStorage(): PendingEdit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingEdit[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(edits: PendingEdit[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  // "storage" only fires in OTHER tabs, not this one -- this is what makes
  // usePendingEdits react immediately in the tab that made the change.
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getPendingEdits(): PendingEdit[] {
  return readStorage();
}

// Upserts by key -- a second staged edit to the same target (e.g. toggling
// Pin on then off again, or editing the same photo's caption twice) before
// syncing replaces the first rather than piling up, since only the latest
// value for any given target matters once Sync actually runs.
export function stagePendingEdit(edit: PendingEdit) {
  const next = [...readStorage().filter((existing) => existing.key !== edit.key), edit];
  writeStorage(next);
}

export function clearPendingEdits() {
  writeStorage([]);
}

export function usePendingEdits(): PendingEdit[] {
  const [edits, setEdits] = useState<PendingEdit[]>([]);

  useEffect(() => {
    setEdits(readStorage());
    function handleChange() {
      setEdits(readStorage());
    }
    window.addEventListener(CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return edits;
}
