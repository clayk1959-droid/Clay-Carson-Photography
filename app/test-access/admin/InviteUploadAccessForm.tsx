"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Covers the gap the per-row "Can submit photos" toggle can't: someone who
// has never requested (or been granted) anything before, so no account row
// exists yet to toggle. Creates the account and sends a real login link.
export function InviteUploadAccessForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/test-access/upload-access-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error();
      setName("");
      setEmail("");
      setStatus("sent");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="invite-upload-access-form">
      <input
        required
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="private-access-input"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="private-access-input"
      />
      <button type="submit" disabled={status === "sending"} className="private-access-pill-btn">
        {status === "sending" ? "…" : "Invite"}
      </button>
      {status === "sent" && <span className="private-access-note">Sent.</span>}
      {status === "error" && <span className="private-access-note">Something went wrong.</span>}
    </form>
  );
}
