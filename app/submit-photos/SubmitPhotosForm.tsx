"use client";

import { useEffect, useState, type FormEvent } from "react";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/tiff";
const LIMIT = 30;

export function SubmitPhotosForm({ name }: { name: string }) {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/photo-submission/status")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.hasAccess) setPendingCount(data.pendingCount);
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
    if (files.length === 0) return;
    setStatus("sending");
    setMessage(null);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const response = await fetch("/api/photo-submission/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Something went wrong — try again.");
        setStatus("error");
        return;
      }
      setPendingCount(data.pendingCount);
      setFiles([]);
      setMessage(`Submitted ${data.uploaded} photo(s). Clay will review them and build the gallery when he can.`);
      setStatus("idle");
    } catch {
      setMessage("Something went wrong — try again.");
      setStatus("error");
    }
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
            <p className="gallery-gate-copy" style={{ margin: 0 }}>
              {`${files.length} file${files.length === 1 ? "" : "s"} selected${
                remaining !== null && files.length > remaining ? ` — only ${remaining} slot(s) left` : ""
              }`}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || files.length === 0 || (remaining !== null && files.length > remaining)}
            className="gallery-gate-button"
          >
            {status === "sending" ? "Submitting…" : "Submit Photos"}
          </button>
        </form>
      )}
      {message && <p className={status === "error" ? "gallery-gate-error" : "gallery-gate-sent"}>{message}</p>}
    </div>
  );
}
