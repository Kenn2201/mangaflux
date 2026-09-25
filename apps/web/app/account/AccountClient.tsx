"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState
} from "react";
import { notify } from "../../lib/toast";
import { AccountSkeleton } from "../Skeletons";
import ConfirmDialog from "../ConfirmDialog";
import PublicProfileModal from "../PublicProfileModal";

type Session = {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    avatarDataUrl?: string | null;
    bio?: string | null;
    showPublicActivity?: boolean;
    showJoinedDate?: boolean;
    communityRestricted?: boolean;
    notificationEmailEnabled?: boolean;
    notificationQuietHoursEnabled?: boolean;
    notificationQuietHoursStart?: string;
    notificationQuietHoursEnd?: string;
    notificationTimeZone?: string;
    emailVerifiedAt?: string | null;
    createdAt: string;
    role?: "user" | "admin";
  } | null;
};

type Progress = {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterLabel?: string | null;
  page: number;
  totalPages: number;
};

type ReaderSummary = {
  bookmarks: Array<{ mangaId: string }>;
  history: Progress[];
  continueReading: Progress | null;
};

type Mode = "login" | "signup";

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not prepare that image."));
    reader.onerror = () =>
      reject(new Error("Could not prepare that image."));
    reader.readAsDataURL(blob);
  });
}

async function imageToAvatar(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 10 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read that image."));
      element.src = objectUrl;
    });

    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = Math.floor((image.naturalWidth - side) / 2);
    const sy = Math.floor((image.naturalHeight - side) / 2);
    const sizes = [224, 192, 160, 128, 112, 96, 80];
    const qualities = [0.82, 0.7, 0.58, 0.46, 0.34, 0.24];
    const formats = ["image/webp", "image/jpeg"] as const;
    const targetBytes = 145_000;

    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Image processing is unavailable.");
      }

      context.drawImage(image, sx, sy, side, side, 0, 0, size, size);

      for (const format of formats) {
        for (const quality of qualities) {
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, format, quality)
          );

          if (
            !blob ||
            blob.size <= 0 ||
            blob.size > targetBytes ||
            !formats.includes(blob.type as (typeof formats)[number])
          ) {
            continue;
          }

          const data = await blobToDataUrl(blob);
          const validPrefix =
            data.startsWith("data:image/webp;base64,") ||
            data.startsWith("data:image/jpeg;base64,");

          if (validPrefix && data.length <= 220_000) {
            return data;
          }
        }
      }
    }

    throw new Error(
      "This image could not be prepared on this browser. Try a different JPEG, PNG, or WebP image."
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AccountClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<ReaderSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [showPublicActivity, setShowPublicActivity] = useState(true);
  const [showJoinedDate, setShowJoinedDate] = useState(true);
  const [notificationEmailEnabled, setNotificationEmailEnabled] =
    useState(true);
  const [notificationQuietHoursEnabled, setNotificationQuietHoursEnabled] =
    useState(false);
  const [notificationQuietHoursStart, setNotificationQuietHoursStart] =
    useState("22:00");
  const [notificationQuietHoursEnd, setNotificationQuietHoursEnd] =
    useState("07:00");
  const [notificationTimeZone, setNotificationTimeZone] = useState("UTC");
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false);

  async function refreshSession() {
    const response = await fetch("/api/auth/session", {
      cache: "no-store"
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      setSession({ authenticated: false, user: null });

      if (response.status === 503) {
        setMessage(
          body?.message ?? "Authentication is not configured yet."
        );
      }
      return;
    }

    setSession((await response.json()) as Session);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  useEffect(() => {
    const user = session?.authenticated ? session.user : null;

    if (!user) {
      setProfileEditing(false);
      setProfileName("");
      setProfileBio("");
      setShowPublicActivity(true);
      setShowJoinedDate(true);
      setNotificationEmailEnabled(true);
      setNotificationQuietHoursEnabled(false);
      setNotificationQuietHoursStart("22:00");
      setNotificationQuietHoursEnd("07:00");
      setNotificationTimeZone("UTC");
      setAvatarDraft(null);
      return;
    }

    setProfileEditing(false);
    setProfileName(user.displayName ?? "");
    setProfileBio(user.bio ?? "");
    setShowPublicActivity(user.showPublicActivity ?? true);
    setShowJoinedDate(user.showJoinedDate ?? true);
    setNotificationEmailEnabled(user.notificationEmailEnabled ?? true);
    setNotificationQuietHoursEnabled(user.notificationQuietHoursEnabled ?? false);
    setNotificationQuietHoursStart(user.notificationQuietHoursStart ?? "22:00");
    setNotificationQuietHoursEnd(user.notificationQuietHoursEnd ?? "07:00");
    setNotificationTimeZone(user.notificationTimeZone ?? "UTC");
    setAvatarDraft(user.avatarDataUrl ?? null);
  }, [session]);

  useEffect(() => {
    if (!session?.authenticated) {
      setSummary(null);
      return;
    }

    let cancelled = false;
    setSummaryLoading(true);

    async function loadSummary() {
      try {
        const response = await fetch("/api/state/summary", {
          cache: "no-store"
        });

        if (!response.ok) return;

        const payload = (await response.json()) as ReaderSummary;
        if (!cancelled) setSummary(payload);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [session?.authenticated]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");
    setNeedsVerification(false);

    try {
      const response = await fetch(
        `/api/auth/${mode === "signup" ? "signup" : "login"}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mangaflux-client": "web"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const body = await response.json().catch(() => null) as {
        error?: string;
        message?: string;
        verificationRequired?: boolean;
        emailSent?: boolean;
      } | null;

      if (!response.ok) {
        if (body?.error === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
        }

        throw new Error(
          body?.message ??
            (mode === "signup"
              ? "Could not create account."
              : "Could not sign in.")
        );
      }

      setPassword("");

      if (mode === "signup") {
        const successMessage = body?.emailSent
          ? "Check your inbox for the MangaFlux verification link."
          : "Account created, but email delivery is not configured yet.";

        setNeedsVerification(true);
        setMessage(successMessage);
        setMode("login");

        notify({
          tone: "success",
          title: "Account created",
          message: successMessage
        });
        return;
      }

      await refreshSession();
      setMessage("");

      notify({
        tone: "success",
        title: "Welcome back",
        message: "Your account library and community profile are ready."
      });
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Authentication failed.";

      setMessage(text);

      notify({
        tone: "error",
        title: "Couldn’t continue",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification(targetEmail = email) {
    if (!targetEmail || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mangaflux-client": "web"
        },
        body: JSON.stringify({ email: targetEmail })
      });

      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.message ?? "Could not resend verification.");
      }

      const text =
        body?.message ??
        "If verification is still needed, a new email has been sent.";

      setMessage(text);

      notify({
        tone: "success",
        title: "Verification email requested",
        message: text
      });
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "Could not resend verification.";

      setMessage(text);

      notify({
        tone: "error",
        title: "Email not sent",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  function beginProfileEdit() {
    if (!user) return;

    setProfileName(user.displayName ?? "");
    setProfileBio(user.bio ?? "");
    setShowPublicActivity(user.showPublicActivity ?? true);
    setShowJoinedDate(user.showJoinedDate ?? true);
    setNotificationEmailEnabled(user.notificationEmailEnabled ?? true);
    setAvatarDraft(user.avatarDataUrl ?? null);
    setProfileEditing(true);
  }

  function cancelProfileEdit() {
    if (!user || profileBusy) return;

    setProfileName(user.displayName ?? "");
    setProfileBio(user.bio ?? "");
    setShowPublicActivity(user.showPublicActivity ?? true);
    setShowJoinedDate(user.showJoinedDate ?? true);
    setNotificationEmailEnabled(user.notificationEmailEnabled ?? true);
    setNotificationQuietHoursEnabled(user.notificationQuietHoursEnabled ?? false);
    setNotificationQuietHoursStart(user.notificationQuietHoursStart ?? "22:00");
    setNotificationQuietHoursEnd(user.notificationQuietHoursEnd ?? "07:00");
    setNotificationTimeZone(user.notificationTimeZone ?? "UTC");
    setAvatarDraft(user.avatarDataUrl ?? null);
    setProfileEditing(false);
  }

  async function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setProfileBusy(true);

    try {
      const avatar = await imageToAvatar(file);
      setAvatarDraft(avatar);

      notify({
        tone: "success",
        title: "Avatar ready",
        message: "Save your profile to publish the new image."
      });
    } catch (error) {
      notify({
        tone: "error",
        title: "Avatar not accepted",
        message:
          error instanceof Error ? error.message : "Try another image."
      });
    } finally {
      setProfileBusy(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profileBusy) return;

    setProfileBusy(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-mangaflux-client": "web"
        },
        body: JSON.stringify({
          displayName: profileName.trim() || null,
          avatarDataUrl: avatarDraft,
          bio: profileBio.trim() || null,
          showPublicActivity,
          showJoinedDate,
          notificationEmailEnabled,
          notificationQuietHoursEnabled,
          notificationQuietHoursStart,
          notificationQuietHoursEnd,
          notificationTimeZone
        })
      });

      const body = await response.json().catch(() => null) as {
        user?: Session["user"];
        message?: string;
      } | null;

      if (!response.ok || !body?.user) {
        throw new Error(body?.message ?? "Profile could not be updated.");
      }

      setSession({
        authenticated: true,
        user: body.user
      });
      setProfileEditing(false);

      notify({
        tone: "success",
        title: "Profile updated",
        message: "Your community identity and privacy settings are updated."
      });
    } catch (error) {
      notify({
        tone: "error",
        title: "Profile update failed",
        message:
          error instanceof Error ? error.message : "Try again shortly."
      });
    } finally {
      setProfileBusy(false);
    }
  }

  async function logout() {
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-mangaflux-client": "web" }
      });

      if (!response.ok) {
        throw new Error("Could not sign out.");
      }

      setSession({ authenticated: false, user: null });
      setSummary(null);

      notify({
        tone: "success",
        title: "Signed out",
        message: "This browser is no longer using your account session."
      });
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Could not sign out.";

      setMessage(text);

      notify({
        tone: "error",
        title: "Sign out failed",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  const user = session?.authenticated ? session.user : null;
  const avatarLabel = user?.displayName || user?.email || "M";
  const initial = avatarLabel.charAt(0).toUpperCase();

  return (
    <section className="account-shell">
      <div className="account-header account-page-heading">
        <div>
          <p className="eyebrow">MangaFlux account</p>
          <h1 className="account-title">Your library, across devices.</h1>
          <p className="account-lede">
            Reading history, bookmarks, recovery, and your MangaFlux community
            identity live here.
          </p>
        </div>
      </div>

      {session === null ? (
        <AccountSkeleton />
      ) : user ? (
        <div className="profile-stack">
          <section className="panel account-panel profile-card">
            <div className="profile-identity">
              <div className="profile-avatar profile-avatar-image" aria-hidden="true">
                {user.avatarDataUrl ? (
                  <img src={user.avatarDataUrl} alt="" />
                ) : (
                  initial
                )}
              </div>

              <div className="profile-identity-copy">
                <p className="eyebrow">Signed in</p>
                <h2>{user.displayName || user.email}</h2>
                {user.displayName ? (
                  <span className="profile-email">{user.email}</span>
                ) : null}
                <span
                  className={`email-badge ${
                    user.emailVerifiedAt ? "verified" : "pending"
                  }`}
                >
                  {user.emailVerifiedAt
                    ? "✓ Verified email"
                    : "Verification pending"}
                </span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <strong>
                  {summaryLoading ? "—" : summary?.bookmarks.length ?? 0}
                </strong>
                <span>Bookmarks</span>
              </div>

              <div className="profile-stat">
                <strong>
                  {summaryLoading ? "—" : summary?.history.length ?? 0}
                </strong>
                <span>Series in progress</span>
              </div>
            </div>

            {summary?.continueReading ? (
              <Link
                className="profile-continue"
                href={`/read/${summary.continueReading.chapterId}?resume=${summary.continueReading.page}`}
              >
                <div>
                  <p className="eyebrow">Continue reading</p>
                  <strong>{summary.continueReading.mangaTitle}</strong>
                  <span>
                    {summary.continueReading.chapterLabel || "Current chapter"} ·
                    Page {summary.continueReading.page} /{" "}
                    {summary.continueReading.totalPages}
                  </span>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </section>

          <section className="panel account-panel community-profile-card">
            <div className="section-heading profile-section-heading">
              <div>
                <p className="eyebrow">Community profile</p>
                <h2>{profileEditing ? "Edit profile" : "Identity & privacy"}</h2>
              </div>

              {!profileEditing ? (
                <div className="profile-heading-actions">
                  <button
                    className="profile-preview-button"
                    type="button"
                    onClick={() => setProfilePreviewOpen(true)}
                  >
                    Preview profile
                  </button>
                  <button
                    className="profile-edit-button"
                    type="button"
                    onClick={beginProfileEdit}
                  >
                    Edit profile
                  </button>
                </div>
              ) : null}
            </div>

            {profileEditing ? (
              <form className="profile-editor" onSubmit={saveProfile}>
                <div className="profile-avatar-editor">
                  <div className="profile-avatar profile-avatar-image">
                    {avatarDraft ? (
                      <img src={avatarDraft} alt="Profile preview" />
                    ) : (
                      initial
                    )}
                  </div>

                  <div>
                    <label className="avatar-upload-button">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={chooseAvatar}
                        disabled={profileBusy}
                      />
                      Choose image
                    </label>

                    {avatarDraft ? (
                      <button
                        className="profile-text-button"
                        type="button"
                        disabled={profileBusy}
                        onClick={() => setAvatarDraft(null)}
                      >
                        Remove avatar
                      </button>
                    ) : null}
                  </div>
                </div>

                <label className="profile-name-field">
                  <span>Display name</span>
                  <input
                    value={profileName}
                    minLength={2}
                    maxLength={32}
                    placeholder="How readers will see you"
                    onChange={(event) => setProfileName(event.target.value)}
                  />
                </label>

                <label className="profile-bio-field">
                  <span>Bio</span>
                  <textarea
                    value={profileBio}
                    maxLength={280}
                    placeholder="A short intro for your MangaFlux community profile"
                    onChange={(event) => setProfileBio(event.target.value)}
                  />
                  <small>{profileBio.length} / 280</small>
                </label>

                <label className="profile-privacy-toggle">
                  <span>
                    <strong>Show public activity</strong>
                    <small>
                      Let readers see your comment/reaction totals and recent public comments.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={showPublicActivity}
                    onChange={(event) =>
                      setShowPublicActivity(event.target.checked)
                    }
                  />
                </label>

                <label className="profile-privacy-toggle">
                  <span>
                    <strong>Show joined date</strong>
                    <small>
                      Show when you joined MangaFlux on your public community profile.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={showJoinedDate}
                    onChange={(event) =>
                      setShowJoinedDate(event.target.checked)
                    }
                  />
                </label>

                <label className="profile-privacy-toggle">
                  <span>
                    <strong>Email notifications</strong>
                    <small>
                      Allow MangaFlux to email you when followed manga with Alerts on receive a new chapter.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={notificationEmailEnabled}
                    onChange={(event) =>
                      setNotificationEmailEnabled(event.target.checked)
                    }
                  />
                </label>

                <div className="notification-quiet-hours">
                  <label className="profile-privacy-toggle">
                    <span>
                      <strong>Quiet hours</strong>
                      <small>
                        Keep inbox notifications, but suppress new-chapter emails during this local time window.
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={notificationQuietHoursEnabled}
                      disabled={!notificationEmailEnabled}
                      onChange={(event) => {
                        const enabled = event.target.checked;
                        setNotificationQuietHoursEnabled(enabled);
                        if (enabled && notificationTimeZone === "UTC") {
                          setNotificationTimeZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
                          );
                        }
                      }}
                    />
                  </label>

                  {notificationQuietHoursEnabled && notificationEmailEnabled ? (
                    <div className="notification-quiet-grid">
                      <label>
                        <span>From</span>
                        <input
                          type="time"
                          value={notificationQuietHoursStart}
                          onChange={(event) =>
                            setNotificationQuietHoursStart(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span>Until</span>
                        <input
                          type="time"
                          value={notificationQuietHoursEnd}
                          onChange={(event) =>
                            setNotificationQuietHoursEnd(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span>Time zone</span>
                        <input
                          value={notificationTimeZone}
                          maxLength={64}
                          onChange={(event) =>
                            setNotificationTimeZone(event.target.value)
                          }
                        />
                      </label>
                      <button
                        className="profile-text-button"
                        type="button"
                        onClick={() =>
                          setNotificationTimeZone(
                            Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
                          )
                        }
                      >
                        Use this device time zone
                      </button>
                    </div>
                  ) : null}
                </div>

                <p className="device-note">
                  Images are cropped and compressed into a small WebP or JPEG
                  for reliable mobile upload. Your email is never shown publicly.
                </p>

                <div className="profile-editor-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={profileBusy}
                    onClick={cancelProfileEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className="account-submit"
                    type="submit"
                    disabled={profileBusy}
                  >
                    {profileBusy ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-readonly">
                <div className="profile-readonly-identity">
                  <div className="profile-avatar profile-avatar-image">
                    {user.avatarDataUrl ? (
                      <img src={user.avatarDataUrl} alt="" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div>
                    <strong>
                      {user.displayName || "MangaFlux Reader"}
                    </strong>
                    <span>
                      {user.bio || "No bio added yet."}
                    </span>
                  </div>
                </div>

                <div className="profile-readonly-privacy">
                  <span>
                    <strong>Public activity</strong>
                    <small>
                      Comment/reaction totals and recent comments
                    </small>
                  </span>
                  <strong>
                    {user.showPublicActivity === false
                      ? "Private"
                      : "Visible"}
                  </strong>
                </div>

                <div className="profile-readonly-privacy">
                  <span>
                    <strong>Joined date</strong>
                    <small>
                      Membership date on your public profile
                    </small>
                  </span>
                  <strong>
                    {user.showJoinedDate === false
                      ? "Hidden"
                      : "Visible"}
                  </strong>
                </div>

                <div className="profile-readonly-privacy">
                  <span>
                    <strong>Email notifications</strong>
                    <small>
                      New-chapter email delivery for followed manga with Alerts on
                    </small>
                  </span>
                  <strong>
                    {user.notificationEmailEnabled === false
                      ? "Off"
                      : "On"}
                  </strong>
                </div>

                <div className="profile-readonly-privacy">
                  <span>
                    <strong>Quiet hours</strong>
                    <small>
                      {user.notificationQuietHoursEnabled
                        ? `${user.notificationQuietHoursStart ?? "22:00"}–${user.notificationQuietHoursEnd ?? "07:00"} · ${user.notificationTimeZone ?? "UTC"}`
                        : "Email quiet hours are disabled"}
                    </small>
                  </span>
                  <strong>
                    {user.notificationQuietHoursEnabled ? "On" : "Off"}
                  </strong>
                </div>

                {user.communityRestricted ? (
                  <div className="community-restriction-notice" role="status">
                    <strong>Community access restricted</strong>
                    <span>
                      Reading and account features still work, but posting comments and reactions is currently unavailable.
                    </span>
                  </div>
                ) : null}

                <p className="device-note">
                  Use Edit profile to change your public identity or privacy.
                  Your email is never shown publicly.
                </p>
              </div>
            )}
          </section>

          <section className="panel account-panel security-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Security</p>
                <h2>Account controls</h2>
              </div>
            </div>

            <div className="security-list">
              <div className="security-row">
                <div>
                  <strong>Email</strong>
                  <span>{user.email}</span>
                </div>
                <span className="security-state">
                  {user.emailVerifiedAt ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="security-row">
                <div>
                  <strong>Password</strong>
                  <span>Reset through your verified inbox</span>
                </div>
                <Link href="/account/forgot">Change</Link>
              </div>

              <div className="security-row">
                <div>
                  <strong>Session</strong>
                  <span>
                    One active session per account. Signing in on another
                    device or browser signs this session out.
                  </span>
                </div>
                <span className="security-state">Newest login</span>
              </div>
            </div>

            {!user.emailVerifiedAt ? (
              <button
                className="email-link-button"
                type="button"
                disabled={busy}
                onClick={() => void resendVerification(user.email)}
              >
                Resend verification email
              </button>
            ) : null}
          </section>

          {user.role === "admin" ? (
            <section className="panel account-panel admin-entry-card">
              <div>
                <p className="eyebrow">Administrator</p>
                <h2>MangaFlux operations</h2>
                <p>
                  Review system activity, recent accounts/community activity,
                  and limited safety controls.
                </p>
              </div>
              <Link href="/admin">Open admin console →</Link>
            </section>
          ) : null}

          <div className="account-actions profile-actions">
            <Link className="account-primary-link" href="/dashboard#library">
              Open library
            </Link>

            <button
              className="secondary-button account-button"
              type="button"
              onClick={() => setSignOutConfirm(true)}
              disabled={busy}
            >
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : (
        <div className="panel account-panel auth-card auth-card-v2">
          <div className="auth-card-intro">
            <div className="auth-mark" aria-hidden="true">M</div>
            <div>
              <p className="eyebrow">Your MangaFlux identity</p>
              <h2>
                {mode === "login" ? "Welcome back." : "Create your reader account."}
              </h2>
              <p>
                Sync reading progress, keep your library, and use one public
                community profile across MangaFlux.
              </p>
            </div>
          </div>

          <div className="auth-benefits" aria-label="Account benefits">
            <span>✓ Synced progress</span>
            <span>✓ Verified recovery</span>
            <span>✓ One active session</span>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "is-active" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "signup" ? "is-active" : ""}
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="12+ characters"
              />
            </label>

            <button
              className="account-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <span className="button-working">
                  <span className="mini-spinner" aria-hidden="true" />
                  Working
                </span>
              ) : mode === "signup" ? (
                "Create MangaFlux account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="auth-helper-row">
            <Link href="/account/forgot">Forgot password?</Link>

            {needsVerification ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void resendVerification()}
              >
                Resend verification
              </button>
            ) : null}
          </div>

          <p className="device-note">
            New accounts receive a verification email from MangaFlux
            &lt;noreply@manga.kenncode.me&gt;. Signing in on another device is
            allowed, but it replaces your previous active session.
          </p>
        </div>
      )}

      {message ? (
        <p className="account-message" role="status">{message}</p>
      ) : null}

      <PublicProfileModal
        userId={profilePreviewOpen && user ? user.id : null}
        onClose={() => setProfilePreviewOpen(false)}
      />

      <ConfirmDialog
        open={signOutConfirm}
        title="Sign out of MangaFlux?"
        description="This browser will lose its active account session. Your bookmarks, reading progress, profile, and comments stay saved to your account."
        confirmLabel="Sign out"
        danger
        busy={busy}
        onCancel={() => setSignOutConfirm(false)}
        onConfirm={() => {
          setSignOutConfirm(false);
          void logout();
        }}
      />
    </section>
  );
}
