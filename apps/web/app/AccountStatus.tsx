"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { notify } from "../lib/toast";

type Session = {
  authenticated: boolean;
  user?: {
    email: string;
    displayName?: string | null;
    avatarDataUrl?: string | null;
  } | null;
};

export const AUTH_SESSION_CHANGED_EVENT = "mangaflux:auth-session-changed";

export function announceAuthSessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export default function AccountStatus() {
  const pathname = usePathname();
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store"
      });

      if (!response.ok) {
        setSession({ authenticated: false, user: null });
        return;
      }

      setSession((await response.json()) as Session);
    } catch {
      setSession({ authenticated: false, user: null });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    const refresh = () => void load();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  async function signOut() {
    if (busy) return;
    setBusy(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-mangaflux-client": "web" }
      });

      if (!response.ok) throw new Error("Could not sign out.");

      setSession({ authenticated: false, user: null });
      setOpen(false);
      announceAuthSessionChanged();
      router.refresh();

      notify({
        tone: "success",
        title: "Signed out",
        message: "This browser is no longer using your account session."
      });
    } catch (error) {
      notify({
        tone: "error",
        title: "Sign out failed",
        message: error instanceof Error ? error.message : "Could not sign out."
      });
    } finally {
      setBusy(false);
    }
  }

  if (session === null) {
    return (
      <span
        className="account-chip account-chip-loading"
        aria-label="Checking account status"
      >
        <span className="skeleton skeleton-dot" />
        <span className="skeleton skeleton-account-label" />
      </span>
    );
  }

  const user = session.user;
  const label = user?.displayName || user?.email || "Account";
  const initial = label.trim().charAt(0).toUpperCase() || "M";

  if (!session.authenticated) {
    return (
      <Link className="account-chip" href="/account">
        <span className="account-chip-avatar" aria-hidden="true">○</span>
        <span className="account-chip-label">Sign in</span>
      </Link>
    );
  }

  return (
    <div className="account-menu-shell" ref={shellRef}>
      <button
        className="account-chip account-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account-chip-avatar" aria-hidden="true">
          {user?.avatarDataUrl ? <img src={user.avatarDataUrl} alt="" /> : initial}
        </span>
        <span className="account-chip-label">{label}</span>
        <span className="account-menu-chevron" aria-hidden="true">⌄</span>
      </button>

      {open ? (
        <div className="account-menu" role="menu">
          <Link role="menuitem" href="/account">Account</Link>
          <Link role="menuitem" href="/dashboard#library">Library</Link>
          <button
            role="menuitem"
            type="button"
            className="account-menu-signout"
            disabled={busy}
            onClick={() => void signOut()}
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
