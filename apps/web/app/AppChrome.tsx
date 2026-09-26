"use client";

import { animate } from "animejs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ReactNode,
  useEffect,
  useRef
} from "react";
import AccountStatus from "./AccountStatus";
import GenreMenu from "./GenreMenu";
import HeaderSearch from "./HeaderSearch";
import ToastHost from "./ToastHost";
import SystemStatusLink from "./SystemStatusLink";

function NavIcon({
  name
}: {
  name: "home" | "browse" | "library" | "account";
}) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }

  if (name === "browse") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
    );
  }

  if (name === "library") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 4.5h5v15h-5zM10.5 4.5h4.5v15h-4.5zM16 6l3.5-1 3 13.5-3.5 1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.8-4.2 3.3-6.5 7.5-6.5s6.7 2.3 7.5 6.5" />
    </svg>
  );
}

export default function AppChrome({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const reader = pathname.startsWith("/read/");

  useEffect(() => {
    if (!reader) {
      requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }));
    }
    if (reader || !contentRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    animate(contentRef.current, {
      opacity: { from: 0.72 },
      y: { from: 6 },
      duration: 280,
      ease: "outQuad"
    });
  }, [pathname, reader]);

  if (reader) {
    return (
      <>
        <a className="skip-link" href="#reader-content">
          Skip to reader
        </a>
        {children}
        <ToastHost />
      </>
    );
  }

  const browseActive =
    pathname.startsWith("/browse") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/genres");
  const libraryActive = pathname.startsWith("/dashboard");
  const accountActive =
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin");

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header discovery-header">
        <div className="site-header-inner discovery-header-inner">
          <Link className="site-brand" href="/" aria-label="MangaFlux home">
            <span className="site-brand-mark">M</span>
            <span className="site-brand-word">MangaFlux</span>
          </Link>

          <HeaderSearch />

          <div className="header-actions">
            <Link
              className="header-dashboard-link"
              href="/dashboard"
              aria-current={libraryActive ? "page" : undefined}
            >
              Dashboard
            </Link>
            <GenreMenu />
            <AccountStatus />
          </div>
        </div>
      </header>

      <div
        className="app-content"
        id="main-content"
        tabIndex={-1}
        ref={contentRef}
      >
        {children}
      </div>

      <footer className="site-footer">
        <div>
          <strong>MangaFlux</strong>
          <span>Discover. Read. Continue anywhere.</span>
        </div>
        <div className="footer-meta">
          <p>
            Manga metadata and chapter attribution are provided by MangaDex and
            credited throughout the reader.
          </p>
          <SystemStatusLink />
        </div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link
          href="/"
          className={pathname === "/" ? "is-active" : ""}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <NavIcon name="home" />
          <span>Home</span>
        </Link>

        <Link
          href="/browse?kind=popular"
          className={browseActive ? "is-active" : ""}
          aria-current={browseActive ? "page" : undefined}
        >
          <NavIcon name="browse" />
          <span>Browse</span>
        </Link>

        <Link
          href="/dashboard#library"
          className={libraryActive ? "is-active" : ""}
          aria-current={libraryActive ? "page" : undefined}
        >
          <NavIcon name="library" />
          <span>Library</span>
        </Link>

        <Link
          href="/account"
          className={accountActive ? "is-active" : ""}
          aria-current={accountActive ? "page" : undefined}
        >
          <NavIcon name="account" />
          <span>Account</span>
        </Link>
      </nav>

      <ToastHost />
    </div>
  );
}
