"use client";

import { useEffect, useState, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";

// image/* rather than listing exact types -- an iPhone's library is full
// of HEIC photos, and being restrictive here risks hiding someone's own
// photos from the picker entirely on some browser/OS combinations. The
// real gate is server-side (allowedContentTypes + a real signature check
// after upload), not this attribute, which is only a picker-UI hint.
const ACCEPTED_TYPES = "image/*";
const LIMIT = 30;

export function SubmitPhotosForm({ name }: { name: string }) {
  const [accountId, setAccountId] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/photo-submission/status")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.hasAccess) {
          setPendingCount(data.pendingCount);
          setAccountId(data.accountId);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = pendingCount === null ? null : LIMIT - pendingCount;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (files.length === 0 || accountId === null) return;
    setStatus("sending");
    setMessage(null);
    setProgress({ done: 0, total: files.length });

    const uploadedNames: string[] = [];
    try {
      // Sequential, not parallel -- the server checks the live pending count
      // on each file's token request, so uploading one at a time is what
      // makes that check (and the counter shown here) accurate.
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        await upload(`submissions/${accountId}/${Date.now()}-${safeName}`, file, {
          access: "private",
          handleUploadUrl: "/api/photo-submission/upload",
        });
        uploadedNames.push(file.name);
        setProgress({ done: uploadedNames.length, total: files.length });
      }
    } catch (err) {
      const uploadedCount = uploadedNames.length;
      if (uploadedCount > 0) {
        await fetch("/api/photo-submission/notify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filenames: uploadedNames }),
        }).catch(() => {});
      }
      setPendingCount((current) => (current ?? 0) + uploadedCount);
      setFiles([]);
      setProgress(null);
      setMessage(
        uploadedCount > 0
          ? `Submitted ${uploadedCount} of ${uploadedNames.length + (files.length - uploadedCount)} before running into a problem: ${err instanceof Error ? err.message : "try the rest again"}.`
          : err instanceof Error
            ? err.message
            : "Something went wrong — try again.",
      );
      setStatus("error");
      return;
    }

    await fetch("/api/photo-submission/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filenames: uploadedNames }),
    }).catch(() => {});

    setPendingCount((current) => (current ?? 0) + uploadedNames.length);
    setFiles([]);
    setProgress(null);
    setMessage(`Submitted ${uploadedNames.length} photo(s). Clay will review them and build the gallery when he can.`);
    setStatus("idle");
  }

  return (
    <div className="gallery-gate">
      <h1 className="page-title" style={{ padding: 0, fontSize: "clamp(28px, 4vw, 44px)" }}>
        Submit Photos
      </h1>
      <p className="gallery-gate-copy">
        {`Hi ${name} — you can submit up to ${LIMIT} photos at a time for Clay to review. He'll build the gallery himself once he's had a chance to go through them, so there may be a delay before anything shows up on the site.`}
      </p>
      {remaining !== null && (
        <p className="gallery-gate-copy">
          {`${pendingCount} of ${LIMIT} submitted, awaiting review — ${remaining} slot${remaining === 1 ? "" : "s"} left.`}
        </p>
      )}

      {remaining === 0 ? (
        <p className="gallery-gate-copy">
          You&apos;re at the limit until Clay reviews what&apos;s already been submitted.
        </p>
      ) : (
        <form className="gallery-gate-form" onSubmit={handleSubmit}>
          <label className="gallery-gate-field">
            <span>Photos</span>
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              onChange={handleFileChange}
              className="gallery-gate-input"
            />
          </label>
          {files.length > 0 && (
            <p
              className={remaining !== null && files.length > remaining ? "gallery-gate-error" : "gallery-gate-copy"}
              style={{ margin: 0 }}
            >
              {remaining !== null && files.length > remaining
                ? `You selected ${files.length} files, but only ${remaining} slot${remaining === 1 ? "" : "s"} are left. Remove ${files.length - remaining} to continue, or submit in batches.`
                : `${files.length} file${files.length === 1 ? "" : "s"} selected`}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || files.length === 0 || (remaining !== null && files.length > remaining)}
            className="gallery-gate-button"
          >
            {status === "sending"
              ? progress
                ? `Uploading ${progress.done} of ${progress.total}…`
                : "Submitting…"
              : "Submit Photos"}
          </button>
        </form>
      )}
      {message && <p className={status === "error" ? "gallery-gate-error" : "gallery-gate-sent"}>{message}</p>}
    </div>
  );
}
