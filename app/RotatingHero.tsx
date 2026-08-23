"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ROTATE_MS = 3250;
const RESUME_AFTER_MS = 3500;
// A phone screen is narrower and typically higher pixel-density than a
// tablet, so the same small amount of natural finger jitter during a hold
// covers more CSS pixels there -- a threshold generous enough to ignore
// that on a phone is still far below any real, deliberate swipe distance.
const SWIPE_THRESHOLD = 90;
// A real swipe is quick. A held finger drifts slightly over several
// seconds (pressing down isn't perfectly still) and can accidentally cross
// the same distance threshold -- requiring the gesture to also be fast
// tells a deliberate swipe apart from a slow hold-and-drift.
const SWIPE_MAX_DURATION_MS = 600;
// Matches the breakpoint globals.css uses to switch the hero layout, plus
// portrait orientation -- a wide tablet held vertically (e.g. an iPad's
// 820-1024px portrait width) is above the 800px cutoff on width alone, so
// without the orientation clause it would get the desktop/horizontal photo
// set even though it's being held like a phone.
const MOBILE_QUERY = "(max-width: 800px), (orientation: portrait)";

function PhotoStack({ photos, variant }: { photos: string[]; variant: "desktop" | "mobile" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // setInterval doesn't fire on creation -- without this, resuming from a
  // pause would wait the full RESUME_AFTER_MS *plus* another whole ROTATE_MS
  // before anything visibly moved. This makes the resumed rotation advance
  // right away instead, then settle into the normal interval after that.
  const justResumed = useRef(false);

  useEffect(() => {
    if (photos.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (justResumed.current) {
      justResumed.current = false;
      setIndex((current) => (current + 1) % photos.length);
    }

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [photos.length, paused]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  function armResumeTimer() {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      resumeTimer.current = null;
      justResumed.current = true;
      setPaused(false);
    }, RESUME_AFTER_MS);
  }

  function handleTouchStart(event: React.TouchEvent) {
    // Touching at all pauses rotation, even before we know if it's a swipe
    // or just a finger resting on the photo -- and cancels any pending
    // resume from a previous touch.
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    setPaused(true);
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY, time: event.timeStamp } : null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;

    if (start && touch && photos.length > 1) {
      const horizontalDistance = touch.clientX - start.x;
      const verticalDistance = touch.clientY - start.y;
      const duration = event.timeStamp - start.time;
      if (
        duration <= SWIPE_MAX_DURATION_MS &&
        Math.abs(horizontalDistance) >= SWIPE_THRESHOLD &&
        Math.abs(horizontalDistance) > Math.abs(verticalDistance)
      ) {
        setIndex((current) =>
          horizontalDistance < 0
            ? (current + 1) % photos.length
            : (current - 1 + photos.length) % photos.length,
        );
      }
    }

    armResumeTimer();
  }

  if (photos.length === 0) return null;

  return (
    <div
      className={`hero-photos hero-photos-${variant}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStart.current = null;
        armResumeTimer();
      }}
    >
      {photos.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          draggable={false}
          className="hero-photo"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      {photos.length > 1 && (
        <div className="hero-dots" aria-hidden="true">
          {photos.map((src, i) => (
            <span key={src} className={i === index ? "hero-dot hero-dot-active" : "hero-dot"} />
          ))}
        </div>
      )}
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
