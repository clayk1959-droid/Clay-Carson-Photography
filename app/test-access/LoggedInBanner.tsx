"use client";

import { useSearchParams } from "next/navigation";

export function LoggedInBanner() {
  const params = useSearchParams();
  if (params.get("loggedin") !== "1") return null;

  return (
    <p className="private-access-banner">
      You&rsquo;re logged in now — try the protected folder again.
    </p>
  );
}
