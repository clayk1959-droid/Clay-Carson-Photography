"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type GalleryPhoto = {
  src: string;
  caption: string;
  altText: string;
  width: number;
  height: number;
  filename: string;
  date: string | null;
  description: string;
};

type CollectionOption = { slug: string; title: string };

export function Gallery({
  name,
  slug,
  photographs,
  otherCollections = [],
  editable = false,
}: {
  name: string;
  slug: string;
  photographs: GalleryPhoto[];
  otherCollections?: CollectionOption[];
  editable?: boolean;
}) {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [activePhotoWidth, setActivePhotoWidth] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<number | null>(null);
  const activeImage = useRef<HTMLImageElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (activePhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      // The edit form has its own Escape handler and text inputs — don't
      // let the lightbox also react while it's open on top.
      if (editingPhoto !== null) return;
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
  }, [activePhoto, photographs.length, editingPhoto]);

  useEffect(() => {
    if (activePhoto !== null) {
      dialog.current?.querySelector<HTMLElement>(".lightbox-close")?.focus();
    }
  }, [activePhoto]);

  useLayoutEffect(() => {
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
          <div className="gallery-thumb-wrap" key={photograph.src}>
            <button
              className="gallery-thumb"
              type="button"
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
            {editable && (
              <button
                className="gallery-edit-button"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingPhoto(index);
                }}
                aria-label={`Edit caption, date, and position for photograph ${index + 1}`}
              >
                <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M14.85 2.85a1.5 1.5 0 0 1 2.12 0l.18.18a1.5 1.5 0 0 1 0 2.12L7.5 14.8l-3.1.8.8-3.1 9.65-9.65Z"
                  />
                </svg>
              </button>
            )}
          </div>
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
          {editable && (
            <button
              className="lightbox-edit"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setEditingPhoto(activePhoto);
              }}
              aria-label="Edit caption, date, and position for this photograph"
            >
              Edit
            </button>
          )}
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
              width={photographs[activePhoto].width}
              height={photographs[activePhoto].height}
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

      {editingPhoto !== null && (
        <EditPhotoForm
          slug={slug}
          photograph={photographs[editingPhoto]}
          position={editingPhoto + 1}
          total={photographs.length}
          otherCollections={otherCollections}
          onClose={() => setEditingPhoto(null)}
        />
      )}

      {editable && <SyncButton />}
    </>
  );
}

function SyncButton() {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "done" && status !== "error") return;
    const timeout = setTimeout(() => setStatus("idle"), 20000);
    return () => clearTimeout(timeout);
  }, [status]);

  async function handleSync() {
    setStatus("syncing");
    setMessage("");
    try {
      const response = await fetch("/api/gallery-sync", { method: "POST" });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.output || "Sync failed.");
      setStatus("done");
      setMessage(body.output);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Sync failed.");
    }
  }

  return (
    <div className="sync-gallery">
      <button
        type="button"
        className="sync-gallery-button"
        disabled={status === "syncing"}
        onClick={handleSync}
      >
        {status === "syncing" ? "Syncing…" : "Sync Gallery"}
      </button>
      {(status === "done" || status === "error") && (
        <div className={status === "error" ? "sync-gallery-status is-error" : "sync-gallery-status"}>
          <button
            type="button"
            className="sync-gallery-status-close"
            onClick={() => setStatus("idle")}
            aria-label="Close sync results"
          >
            ×
          </button>
          <pre>{message}</pre>
        </div>
      )}
    </div>
  );
}

function EditPhotoForm({
  slug,
  photograph,
  position,
  total,
  otherCollections,
  onClose,
}: {
  slug: string;
  photograph: GalleryPhoto;
  position: number;
  total: number;
  otherCollections: CollectionOption[];
  onClose: () => void;
}) {
  const [caption, setCaption] = useState(photograph.description);
  const [date, setDate] = useState(photograph.date ?? "");
  const [order, setOrder] = useState(String(position));
  const [moveTarget, setMoveTarget] = useState(otherCollections[0]?.slug ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState<ReactNode>(null);
  const [confirming, setConfirming] = useState<"delete" | "move" | null>(null);

  useEffect(() => {
    if (!confirming) return;
    const timeout = setTimeout(() => setConfirming(null), 8000);
    return () => clearTimeout(timeout);
  }, [confirming]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function submitChange(body: Record<string, unknown>, message: ReactNode) {
    setStatus("saving");
    setErrorMessage("");
    try {
      const response = await fetch("/api/gallery-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, filename: photograph.filename, ...body }),
      });
      if (!response.ok) throw new Error(await response.text());
      setSavedMessage(message);
      setStatus("saved");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    submitChange(
      { caption: caption.trim(), date: date || null, order: Number(order) },
      <>Saved — click <strong>Sync Gallery</strong> (bottom right) to apply.</>,
    );
  }

  function handleDelete() {
    if (confirming !== "delete") {
      setConfirming("delete");
      return;
    }
    setConfirming(null);
    submitChange(
      { hidden: true },
      <>Deleted — click <strong>Sync Gallery</strong> (bottom right) to apply.</>,
    );
  }

  async function handleMove() {
    if (!moveTarget) return;
    if (confirming !== "move") {
      setConfirming("move");
      return;
    }
    setConfirming(null);
    const targetTitle = otherCollections.find((option) => option.slug === moveTarget)?.title ?? moveTarget;
    setStatus("saving");
    setErrorMessage("");
    try {
      const response = await fetch("/api/gallery-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSlug: slug, toSlug: moveTarget, filename: photograph.filename }),
      });
      if (!response.ok) throw new Error(await response.text());
      setSavedMessage(
        <>
          Moved to <strong>{targetTitle}</strong> — click <strong>Sync Gallery</strong> (bottom
          right) to apply.
        </>,
      );
      setStatus("saved");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <div className="edit-photo-overlay" onClick={onClose}>
      <form
        className="edit-photo-form"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSave}
      >
        <h2>
          Edit photograph {position} of {total}
        </h2>

        <label>
          Caption
          <input
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            required
          />
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <label>
          Position
          <input
            type="number"
            min={1}
            max={total}
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            required
          />
        </label>

        {otherCollections.length > 0 && (
          <div className="edit-photo-move">
            <label>
              Move to
              <select
                value={moveTarget}
                onChange={(event) => {
                  setMoveTarget(event.target.value);
                  setConfirming(null);
                }}
              >
                {otherCollections.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" disabled={status === "saving"} onClick={handleMove}>
              {confirming === "move" ? "Confirm?" : "Move"}
            </button>
          </div>
        )}

        {status === "error" && <p className="edit-photo-status is-error">{errorMessage}</p>}
        {status === "saved" && <p className="edit-photo-status">{savedMessage}</p>}

        <div className="edit-photo-actions">
          <button
            type="button"
            className="edit-photo-delete"
            disabled={status === "saving"}
            onClick={handleDelete}
          >
            {confirming === "delete" ? "Confirm delete?" : "Delete photo"}
          </button>
          <button
            type="button"
            className="edit-photo-reset"
            disabled={status === "saving"}
            onClick={() =>
              submitChange({ reset: true }, "Restored to auto-detected caption, date, and order.")
            }
          >
            Reset to auto-detected
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
