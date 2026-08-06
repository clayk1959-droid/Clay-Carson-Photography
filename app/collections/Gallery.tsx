"use client";

import { useEffect, useRef, useState } from "react";

type GalleryPhoto = {
  src: string;
  caption: string;
  altText: string;
  width: number;
  height: number;
};

export function Gallery({
  name,
  photographs,
}: {
  name: string;
  photographs: GalleryPhoto[];
}) {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [activePhotoWidth, setActivePhotoWidth] = useState<number | null>(null);
  const activeImage = useRef<HTMLImageElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (activePhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft") {
        setActivePhoto((current) =>
          current === null
            ? null
            : (current - 1 + photographs.length) % photographs.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActivePhoto((current) =>
          current === null ? null : (current + 1) % photographs.length,
        );
      }
      if (event.key === "Tab") {
        const controls = dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, photographs.length]);

  useEffect(() => {
    if (activePhoto !== null) {
      dialog.current?.querySelector<HTMLElement>(".lightbox-close")?.focus();
    }
  }, [activePhoto]);

  useEffect(() => {
    if (activePhoto === null || !activeImage.current) return;

    const image = activeImage.current;
    const updateWidth = () => setActivePhotoWidth(image.getBoundingClientRect().width);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(image);
    return () => observer.disconnect();
  }, [activePhoto]);

  function showPrevious() {
    setActivePhoto((current) =>
      current === null
        ? null
        : (current - 1 + photographs.length) % photographs.length,
    );
  }

  function showNext() {
    setActivePhoto((current) =>
      current === null ? null : (current + 1) % photographs.length,
    );
  }

  function openPhoto(index: number) {
    previousFocus.current = document.activeElement as HTMLElement | null;
    setActivePhoto(index);
  }

  function closePhoto() {
    setActivePhoto(null);
    requestAnimationFrame(() => previousFocus.current?.focus());
  }

  return (
    <>
      <div className="photo-gallery">
        {photographs.map((photograph, index) => (
          <button
            className="gallery-thumb"
            type="button"
            key={photograph.src}
            onClick={() => openPhoto(index)}
            aria-label={`Open ${name} photograph ${index + 1} of ${photographs.length}`}
          >
            <img
              src={photograph.src.replace(
                "/galleries/",
                "/gallery-thumbnails/",
              )}
              alt={photograph.altText}
              width={photograph.width}
              height={photograph.height}
              loading={index < 4 ? "eager" : "lazy"}
            />
            <span className="gallery-thumb-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {activePhoto !== null && (
        <div
          ref={dialog}
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photograph ${activePhoto + 1} of ${photographs.length}`}
          onClick={closePhoto}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={closePhoto}
            aria-label="Close photograph"
          >
            Close
          </button>
          <button
            className="lightbox-arrow lightbox-previous"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous photograph"
          >
            ‹
          </button>
          <figure
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStart.current = touch
                ? { x: touch.clientX, y: touch.clientY }
                : null;
            }}
            onTouchCancel={() => {
              touchStart.current = null;
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              const touch = event.changedTouches[0];
              touchStart.current = null;

              if (!start || !touch) return;

              const horizontalDistance = touch.clientX - start.x;
              const verticalDistance = touch.clientY - start.y;

              if (
                Math.abs(horizontalDistance) < 50 ||
                Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
              ) {
                return;
              }

              if (horizontalDistance < 0) showNext();
              else showPrevious();
            }}
          >
            <img
              ref={activeImage}
              src={photographs[activePhoto].src}
              alt={photographs[activePhoto].altText}
              onLoad={(event) =>
                setActivePhotoWidth(event.currentTarget.getBoundingClientRect().width)
              }
            />
            <figcaption
              style={activePhotoWidth ? { width: activePhotoWidth } : undefined}
            >
              <span className="lightbox-caption">
                {photographs[activePhoto].caption}
              </span>
              <span className="lightbox-count">
                {String(activePhoto + 1).padStart(2, "0")} / {photographs.length}
              </span>
            </figcaption>
          </figure>
          <button
            className="lightbox-arrow lightbox-next"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next photograph"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
