"use client";

import { useEffect, useRef, useState } from "react";

export function SiteHeader({
  showHome = false,
  tagline,
}: {
  showHome?: boolean;
  tagline?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="nav-toggle-wrap" ref={wrapRef}>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
          {open && (
            <nav className="nav-menu" aria-label="Main navigation">
              {showHome && <a href="/">Home</a>}
              <a href="/collections">Galleries</a>
              <a href="/about">About</a>
            </nav>
          )}
        </div>
        <div className="brand-block">
          <a className="brand" href="/" aria-label="Carson & Muller Family, home">
            Carson &amp; Muller <small>FAMILY</small>
          </a>
          {tagline && <p className="site-tagline">{tagline}</p>}
        </div>
      </div>
    </header>
  );
}
