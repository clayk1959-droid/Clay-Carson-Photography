"use client";

import { useEffect, useState } from "react";

// Only renders for an account that's been granted upload access -- checked
// via session on every load, same mechanism as private-gallery access. No
// grant means this renders nothing at all, not even a disabled/greyed link.
export function SubmitPhotosLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/photo-submission/status")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.hasAccess) setVisible(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;
  return (
    <a href="/submit-photos" className="submit-photos-link">
      Submit Photos
    </a>
  );
}
