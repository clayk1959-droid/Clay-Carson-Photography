"use client";

import { useState, type FormEvent } from "react";

// Shown instead of <Gallery> on a private collection's page when the
// visitor doesn't have (or doesn't yet have) access -- same request →
// owner-approves-by-email → magic-link flow already tested end to end in
// the separate test system, just scoped to one specific gallery now.
export function GalleryAccessGate({ gallerySlug }: { gallerySlug: string }) {
  const [mode, setMode] = useState<"request" | "resend">("request");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRequestSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/gallery-access/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, gallerySlug }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Request failed");
      }
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong — try again.");
      setStatus("error");
    }
  }

  // No confirmation either way whether the email actually has access --
  // /api/gallery-access/resend deliberately gives the same response
  // regardless, so this can't be used to check who's been granted access.
  async function handleResendSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/gallery-access/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, gallerySlug }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong");
      }
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong — try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="gallery-gate">
        <p className="gallery-gate-sent">
          {mode === "request"
            ? "Thanks — you'll get an email with a link to get in as soon as it's approved."
            : "If that email already has access, a login link is on its way."}
        </p>
      </div>
    );
  }

  return (
    <div className="gallery-gate">
      {mode === "request" ? (
        <>
          <p className="gallery-gate-copy">
            This gallery is private. Ask for access below and you&apos;ll get an email once
            it&apos;s approved.
          </p>
          <form onSubmit={handleRequestSubmit} className="gallery-gate-form">
            <label className="gallery-gate-field">
              <span>Name</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="gallery-gate-input"
              />
            </label>
            <label className="gallery-gate-field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="gallery-gate-input"
              />
            </label>
            <button type="submit" disabled={status === "sending"} className="gallery-gate-button">
              {status === "sending" ? "Sending…" : "Request Access"}
            </button>
            {status === "error" && <p className="gallery-gate-error">{errorMessage}</p>}
          </form>
          <button
            type="button"
            className="gallery-gate-switch"
            onClick={() => {
              setMode("resend");
              setStatus("idle");
              setErrorMessage("");
            }}
          >
            Already approved on another device? Resend my login link
          </button>
        </>
      ) : (
        <>
          <p className="gallery-gate-copy">
            Already have access? Enter the email you were approved with and we&apos;ll send a
            fresh login link.
          </p>
          <form onSubmit={handleResendSubmit} className="gallery-gate-form">
            <label className="gallery-gate-field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="gallery-gate-input"
              />
            </label>
            <button type="submit" disabled={status === "sending"} className="gallery-gate-button">
              {status === "sending" ? "Sending…" : "Resend Login Link"}
            </button>
            {status === "error" && <p className="gallery-gate-error">{errorMessage}</p>}
          </form>
          <button
            type="button"
            className="gallery-gate-switch"
            onClick={() => {
              setMode("request");
              setStatus("idle");
              setErrorMessage("");
            }}
          >
            Need to request access instead?
          </button>
        </>
      )}
    </div>
  );
}
