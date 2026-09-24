export type MangaFluxRole = "user" | "admin";

function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminConfigured() {
  return configuredAdminEmails().size > 0;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return configuredAdminEmails().has(email.trim().toLowerCase());
}

export function roleForEmail(
  email: string | null | undefined
): MangaFluxRole {
  return isAdminEmail(email) ? "admin" : "user";
}
