"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const ROTATE_MS = 3250;
// Matches the breakpoint globals.css uses to switch the hero layout.
const MOBILE_QUERY = "(max-width: 800px)";

function PhotoStack({ photos, variant }: { photos: string[]; variant: "desktop" | "mobile" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className={`hero-photos hero-photos-${variant}`}>
      {photos.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className="hero-photo"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

export function RotatingHero({
  desktopPhotos,
  mobilePhotos,
}: {
  desktopPhotos: string[];
  mobilePhotos: string[];
}) {
  // Only ever mount the photo set the screen actually needs. Rendering both
  // and letting CSS display:none hide one doesn't stop the browser from
  // downloading it -- on a phone that meant fetching every desktop-size
  // photo too, on top of the mobile set, which was enough to trip Safari's
  // memory-pressure page reload and silently reset the carousel back to
  // photo #1 before anyone saw it advance.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    setIsMobile(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (isMobile === null) return null;

  return isMobile ? (
    <PhotoStack photos={mobilePhotos} variant="mobile" />
  ) : (
    <PhotoStack photos={desktopPhotos} variant="desktop" />
  );
}
