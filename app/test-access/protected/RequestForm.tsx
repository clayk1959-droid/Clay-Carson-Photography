"use client";

import { useState, type FormEvent } from "react";

export function RequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/test-access/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, note }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="private-access-sent">
        Sent! Check your email for a magic link — once you click it, come back to{" "}
        <a href="/test-access" className="private-access-back">the main page</a> and try this folder
        again.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="private-access-form">
      <label className="private-access-field">
        <span>Name</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="private-access-input"
        />
      </label>
      <label className="private-access-field">
        <span>Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="private-access-input"
        />
      </label>
      <label className="private-access-field">
        <span>Note (optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="private-access-textarea"
        />
      </label>
      <button type="submit" disabled={status === "sending"} className="private-access-button">
        {status === "sending" ? "Sending…" : "Request Access"}
      </button>
      {status === "error" && <p className="private-access-error">Something went wrong — try again.</p>}
    </form>
  );
}
