"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SiteHeader } from "../SiteHeader";
import { formatDate } from "../../scripts/lib/format-date.mjs";

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
  remoteMode = false,
}: {
  name: string;
  slug: string;
  photographs: GalleryPhoto[];
  otherCollections?: CollectionOption[];
  editable?: boolean;
  // True only on the password-protected remote editor deployment. Neither
  // "Sync Gallery" (there's nothing to run remotely -- edits commit
  // straight to GitHub instead) nor "Reset to auto-detected" (needs the
  // full-resolution originals, which only exist on the owner's own Mac)
  // apply there, so both are hidden rather than shown non-functional.
  remoteMode?: boolean;
}) {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [activePhotoWidth, setActivePhotoWidth] = useState<number | null>(null);
  const [arrowMetrics, setArrowMetrics] = useState<{
    top: number;
    left: number;
    right: number;
  } | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const activeImage = useRef<HTMLImageElement | null>(null);
  const photoGallery = useRef<HTMLDivElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const galleryEl = photoGallery.current;
    if (!galleryEl) return;

    // WebKit sometimes ignores this image's max-height:100% when it's a
    // percentage of an aspect-ratio-sized ancestor (a known Safari bug),
    // letting the photo bleed past its intended letterboxed size. Every
    // thumbnail box is the same size (uniform grid columns), so measuring
    // just one and sharing that as an exact pixel value sidesteps the
    // percentage-resolution bug for all of them at once.
    const updateThumbSize = () => {
      const thumb = galleryEl.querySelector<HTMLElement>(".gallery-thumb");
      if (!thumb) return;
      const inner = Math.max(0, thumb.getBoundingClientRect().width - 20);
      galleryEl.style.setProperty("--thumb-inner", `${inner}px`);
    };
    updateThumbSize();

    const observer = new ResizeObserver(updateThumbSize);
    observer.observe(galleryEl);
    return () => observer.disconnect();
  }, [photographs.length]);

  const showPrevious = useCallback(() => {
    setActivePhoto((current) =>
      current === null || current === 0 ? current : current - 1,
    );
  }, []);

  const showNext = useCallback(() => {
    setActivePhoto((current) =>
      current === null || current === photographs.length - 1 ? current : current + 1,
    );
  }, [photographs.length]);

  useEffect(() => {
    const photoParam = new URLSearchParams(window.location.search).get("photo");
    if (photoParam === null) return;

    const index = Number(photoParam) - 1;
    if (Number.isInteger(index) && index >= 0 && index < photographs.length) {
      setActivePhoto(index);
    }
  }, [photographs.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activePhoto === null) {
      params.delete("photo");
    } else {
      params.set("photo", String(activePhoto + 1));
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [activePhoto]);

  useEffect(() => {
    if (activePhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      // The edit form has its own Escape handler and text inputs — don't
      // let the lightbox also react while it's open on top.
      if (editingPhoto !== null) return;
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
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
  }, [activePhoto, photographs.length, editingPhoto, showPrevious, showNext]);

  useEffect(() => {
    if (activePhoto !== null) {
      dialog.current?.querySelector<HTMLElement>(".lightbox-close")?.focus();
    }
  }, [activePhoto]);

  useLayoutEffect(() => {
    if (activePhoto === null || !activeImage.current) return;

    const image = activeImage.current;
    const figureEl = image.closest("figure");

    const updateMetrics = () => {
      const imageRect = image.getBoundingClientRect();
      setActivePhotoWidth(imageRect.width);

      if (figureEl) {
        const figureRect = figureEl.getBoundingClientRect();
        setArrowMetrics({
          top: imageRect.top - figureRect.top + imageRect.height / 2,
          left: imageRect.left - figureRect.left,
          right: figureRect.right - imageRect.right,
        });
      }
    };
    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(image);
    window.addEventListener("resize", updateMetrics);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [activePhoto]);

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
      <div className="photo-gallery" ref={photoGallery}>
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
          <div onClick={(event) => event.stopPropagation()}>
            <SiteHeader showHome />
          </div>
          <div className="lightbox-toolbar">
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
              className="lightbox-close"
              type="button"
              onClick={closePhoto}
              aria-label="Back to gallery"
            >
              Back
            </button>
          </div>
          <div className="lightbox-body">
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
            <button
              className="lightbox-arrow lightbox-previous"
              type="button"
              style={
                arrowMetrics
                  ? { top: arrowMetrics.top, left: arrowMetrics.left + 12 }
                  : undefined
              }
              disabled={activePhoto === 0}
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous photograph"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 6 9 12 15 18" />
              </svg>
            </button>
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
              <div className="lightbox-caption-group">
                <span className="lightbox-caption">
                  {photographs[activePhoto].description}
                </span>
                {photographs[activePhoto].date && (
                  <span className="lightbox-date">
                    {formatDate(photographs[activePhoto].date)}
                  </span>
                )}
              </div>
              <span className="lightbox-count">
                {String(activePhoto + 1).padStart(2, "0")} / {photographs.length}
              </span>
            </figcaption>
            <button
              className="lightbox-arrow lightbox-next"
              type="button"
              style={
                arrowMetrics
                  ? { top: arrowMetrics.top, right: arrowMetrics.right + 12 }
                  : undefined
              }
              disabled={activePhoto === photographs.length - 1}
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next photograph"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </figure>
          </div>
        </div>
      )}

      {editingPhoto !== null && (
        <EditPhotoForm
          slug={slug}
          photograph={photographs[editingPhoto]}
          position={editingPhoto + 1}
          total={photographs.length}
          otherCollections={otherCollections}
          remoteMode={remoteMode}
          onClose={() => setEditingPhoto(null)}
        />
      )}

      {reordering && (
        <ReorderPanel
          slug={slug}
          photographs={photographs}
          remoteMode={remoteMode}
          onClose={() => setReordering(false)}
        />
      )}

      {editable && (
        <div className="editor-toolbar">
          <button type="button" className="reorder-button" onClick={() => setReordering(true)}>
            Reorder Photos
          </button>
          {!remoteMode && <SyncButton />}
        </div>
      )}
    </>
  );
}

function ReorderPanel({
  slug,
  photographs,
  remoteMode = false,
  onClose,
}: {
  slug: string;
  photographs: GalleryPhoto[];
  remoteMode?: boolean;
  onClose: () => void;
}) {
  const [order, setOrder] = useState(photographs.map((photograph) => photograph.filename));
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const byFilename = new Map(photographs.map((photograph) => [photograph.filename, photograph]));

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function moveTo(targetIndex: number) {
    const fromIndex = dragIndex.current;
    if (fromIndex === null || fromIndex === targetIndex) return;
    setOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    dragIndex.current = targetIndex;
    setDirty(true);
  }

  // Pointer Events (not the native HTML5 drag-and-drop API) so this works
  // the same way with mouse, touch, and pen -- native drag-and-drop simply
  // never fires on touch devices at all. Pointer capture keeps move/up
  // events targeted at the thumb a drag started on even as the finger
  // moves elsewhere, so hit-testing what's actually under the pointer has
  // to go through elementFromPoint rather than the event's own target.
  function handlePointerDown(event: React.PointerEvent, index: number) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragIndex.current = index;
    dragOverIndex.current = index;
    setDraggingIndex(index);
    // Best-effort -- touch already gets implicit capture per the pointer
    // events spec, so a failure here (seen in a couple of edge cases) isn't
    // fatal to the drag, just not worth letting crash the whole panel.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignored -- see comment above.
    }
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (dragIndex.current === null) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const thumbEl = target?.closest<HTMLElement>("[data-reorder-index]");
    if (!thumbEl) return;
    const overIndex = Number(thumbEl.dataset.reorderIndex);
    if (!Number.isNaN(overIndex) && dragOverIndex.current !== overIndex) {
      dragOverIndex.current = overIndex;
      moveTo(overIndex);
    }
  }

  function handlePointerUp(event: React.PointerEvent) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingIndex(null);
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage("");
    try {
      const response = await fetch("/api/gallery-reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, filenames: order }),
      });
      if (!response.ok) throw new Error(await response.text());
      setStatus("saved");
      setDirty(false);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <div className="reorder-overlay" onClick={onClose}>
      <div className="reorder-panel" onClick={(event) => event.stopPropagation()}>
        <div className="reorder-header">
          <h2>Drag photos to reorder</h2>
          <div className="reorder-header-actions">
            {status === "error" && <span className="edit-photo-status is-error">{errorMessage}</span>}
            {status === "saved" && !dirty && (
              <span className="edit-photo-status">
                {remoteMode ? (
                  "Saved — live on the site within a minute or two."
                ) : (
                  <>Saved — click <strong>Sync Gallery</strong> to apply.</>
                )}
              </span>
            )}
            <button
              type="button"
              className="reorder-save"
              disabled={!dirty || status === "saving"}
              onClick={handleSave}
            >
              {status === "saving" ? "Saving…" : "Save order"}
            </button>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div className="reorder-grid">
          {order.map((filename, index) => {
            const photograph = byFilename.get(filename);
            if (!photograph) return null;
            return (
              <div
                key={filename}
                className={index === draggingIndex ? "reorder-thumb is-dragging" : "reorder-thumb"}
                data-reorder-index={index}
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <img
                  src={photograph.src.replace("/galleries/", "/gallery-thumbnails/")}
                  alt={photograph.altText}
                  draggable={false}
                />
                <span className="reorder-thumb-number">{String(index + 1).padStart(2, "0")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
  remoteMode = false,
  onClose,
}: {
  slug: string;
  photograph: GalleryPhoto;
  position: number;
  total: number;
  otherCollections: CollectionOption[];
  remoteMode?: boolean;
  onClose: () => void;
}) {
  const [caption, setCaption] = useState(photograph.description);
  const [date, setDate] = useState(photograph.date ?? "");
  const [order, setOrder] = useState(String(position));
  const [moveTarget, setMoveTarget] = useState(otherCollections[0]?.slug ?? "");
  const [coverPosition, setCoverPosition] = useState("center center");
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

  const applyMessage = remoteMode ? (
    <>live on the site within a minute or two.</>
  ) : (
    <>click <strong>Sync Gallery</strong> (bottom right) to apply.</>
  );

  function handleSave(event: FormEvent) {
    event.preventDefault();
    submitChange(
      { caption: caption.trim(), date: date || null, order: Number(order) },
      <>Saved — {applyMessage}</>,
    );
  }

  function handleDelete() {
    if (confirming !== "delete") {
      setConfirming("delete");
      return;
    }
    setConfirming(null);
    submitChange({ hidden: true }, <>Deleted — {applyMessage}</>);
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

  async function handleSetCover(cropPosition: string) {
    setStatus("saving");
    setErrorMessage("");
    try {
      const response = await fetch("/api/gallery-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, filename: photograph.filename, position: cropPosition }),
      });
      if (!response.ok) throw new Error(await response.text());
      setSavedMessage(<>Set as the gallery cover — {applyMessage}</>);
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

        <div className="edit-photo-cover">
          <p>Use this photo as the gallery&rsquo;s cover — preview and pick a crop:</p>
          <div className="edit-photo-cover-row">
            <div className="edit-photo-cover-preview">
              <img src={photograph.src} alt="" style={{ objectPosition: coverPosition }} />
            </div>
            <div className="edit-photo-cover-grid">
              {[
                ["left top", "↖"],
                ["center top", "↑"],
                ["right top", "↗"],
                ["left center", "←"],
                ["center center", "•"],
                ["right center", "→"],
                ["left bottom", "↙"],
                ["center bottom", "↓"],
                ["right bottom", "↘"],
              ].map(([value, symbol]) => (
                <button
                  key={value}
                  type="button"
                  className={coverPosition === value ? "is-selected" : undefined}
                  disabled={status === "saving"}
                  aria-label={`Preview crop from ${value}`}
                  onClick={() => setCoverPosition(value)}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="edit-photo-cover-confirm"
            disabled={status === "saving"}
            onClick={() => handleSetCover(coverPosition)}
          >
            Set as gallery cover
          </button>
        </div>

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
          {!remoteMode && (
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
          )}
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
