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
import ToastHost from "./ToastHost";

function NavIcon({
  name
}: {
  name: "home" | "search" | "library" | "account";
}) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }

  if (name === "search") {
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
        {children}
        <ToastHost />
      </>
    );
  }

  const accountActive = pathname.startsWith("/account");

  return (
    <div className="app-frame">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="site-brand" href="/" aria-label="MangaFlux home">
            <span className="site-brand-mark">M</span>
            <span className="site-brand-word">MangaFlux</span>
          </Link>

          <nav className="site-desktop-nav" aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/#library">Library</Link>
            <Link href="/#search">Search</Link>
          </nav>

          <AccountStatus />
        </div>
      </header>

      <div className="app-content" ref={contentRef}>
        {children}
      </div>

      <footer className="site-footer">
        <div>
          <strong>MangaFlux</strong>
          <span>Mobile-first manga reading.</span>
        </div>
        <p>
          Manga metadata and chapter attribution are provided by MangaDex and
          credited in the reader.
        </p>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/" className={pathname === "/" ? "is-active" : ""}>
          <NavIcon name="home" />
          <span>Home</span>
        </Link>
        <Link href="/#search">
          <NavIcon name="search" />
          <span>Search</span>
        </Link>
        <Link href="/#library">
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
