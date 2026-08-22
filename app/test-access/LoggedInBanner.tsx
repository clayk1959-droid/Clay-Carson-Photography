"use client";

import { useSearchParams } from "next/navigation";

export function LoggedInBanner() {
  const params = useSearchParams();
  if (params.get("loggedin") !== "1") return null;

  return (
    <p style={{ padding: "12px 16px", background: "#e8e3d8", marginBottom: 24 }}>
      You&rsquo;re logged in now — try the protected folder again.
    </p>
  );
}
