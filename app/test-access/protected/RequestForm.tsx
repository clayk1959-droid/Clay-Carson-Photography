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
      <div>
        <p style={{ marginBottom: 16 }}>
          Sent! Check your email for a magic link — once you click it, come back to{" "}
          <a href="/test-access">the main page</a> and try this folder again.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Name</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{ padding: 10, border: "1px solid #7a7a7a" }}
        />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ padding: 10, border: "1px solid #7a7a7a" }}
        />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Note (optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          style={{ padding: 10, border: "1px solid #7a7a7a", fontFamily: "inherit" }}
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        style={{ padding: "12px 20px", background: "#171a17", color: "#f5f2eb", border: 0, cursor: "pointer" }}
      >
        {status === "sending" ? "Sending…" : "Request Access"}
      </button>
      {status === "error" && <p style={{ color: "#a33" }}>Something went wrong — try again.</p>}
    </form>
  );
}
