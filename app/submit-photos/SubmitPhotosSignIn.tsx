"use client";

import { useState, type FormEvent } from "react";

// Shown instead of the upload form when there's no valid session -- covers
// both a brand-new invite (their first-ever visit) and an existing account
// that's simply signed out on this device/browser. No self-serve "request
// access" here, unlike a private gallery's gate -- this only re-sends a
// login link for an email that already has upload access; it can't grant
// new access to anyone.
export function SubmitPhotosSignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      await fetch("/api/gallery-access/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="gallery-gate">
        <p className="gallery-gate-sent">If that email has been given access to submit photos, a login link is on its way.</p>
      </div>
    );
  }

  return (
    <div className="gallery-gate">
      <p className="gallery-gate-copy">
        Enter the email Clay gave you access with, and we&apos;ll send a login link.
      </p>
      <form onSubmit={handleSubmit} className="gallery-gate-form">
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
          {status === "sending" ? "Sending…" : "Send Login Link"}
        </button>
      </form>
    </div>
  );
}
