"use client";

import { useState, type FormEvent } from "react";

type Step = "phone" | "code" | "done";

export function SmsAlertsForm() {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");

  async function handleRequestCode(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/sms-alerts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Something went wrong — try again.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — try again.");
    } finally {
      setStatus("idle");
    }
  }

  async function handleConfirmCode(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/sms-alerts/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Something went wrong — try again.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="gallery-gate">
      <h1 className="page-title" style={{ padding: 0, fontSize: "clamp(28px, 4vw, 44px)" }}>
        Site Alert Texts
      </h1>

      {step === "phone" && (
        <>
          <p className="gallery-gate-copy">
            Enter a phone number to receive text alerts for this site: someone requesting private
            gallery access, someone submitting photos, or a deploy failure. You&apos;ll get a text
            with a confirmation code to enter on the next step. Message and data rates may apply.
            Reply STOP at any time to unsubscribe.
          </p>
          <form className="gallery-gate-form" onSubmit={handleRequestCode}>
            <label className="gallery-gate-field">
              <span>Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="gallery-gate-input"
                required
              />
            </label>
            <button type="submit" disabled={status === "sending"} className="gallery-gate-button">
              {status === "sending" ? "Sending…" : "Send Code"}
            </button>
          </form>
        </>
      )}

      {step === "code" && (
        <>
          <p className="gallery-gate-copy">
            A code was texted to {phoneNumber}. Enter it below to confirm.
          </p>
          <form className="gallery-gate-form" onSubmit={handleConfirmCode}>
            <label className="gallery-gate-field">
              <span>6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="gallery-gate-input"
                required
              />
            </label>
            <button type="submit" disabled={status === "sending" || code.length !== 6} className="gallery-gate-button">
              {status === "sending" ? "Confirming…" : "Confirm"}
            </button>
            <button
              type="button"
              className="gallery-gate-switch"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
            >
              Use a different number
            </button>
          </form>
        </>
      )}

      {step === "done" && (
        <p className="gallery-gate-sent">
          Confirmed — {phoneNumber} will now receive site alert texts.
        </p>
      )}

      {error && <p className="gallery-gate-error">{error}</p>}
    </div>
  );
}
