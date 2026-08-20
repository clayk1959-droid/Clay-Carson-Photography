"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const ROTATE_MS = 7000;

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
  return (
    <>
      <PhotoStack photos={desktopPhotos} variant="desktop" />
      <PhotoStack photos={mobilePhotos} variant="mobile" />
    </>
  );
}
