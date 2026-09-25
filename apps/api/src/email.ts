const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "MangaFlux <noreply@manga.kenncode.me>";
const DEFAULT_ORIGIN = "https://manga.kenncode.me";

function apiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

function fromAddress() {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

function appOrigin() {
  return (process.env.APP_ORIGIN?.trim() || DEFAULT_ORIGIN)
    .replace(/\/$/, "");
}

export function isEmailConfigured() {
  return Boolean(apiKey());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(input: {
  preheader: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  note: string;
}) {
  const url = escapeHtml(input.buttonUrl);

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#070707;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070707;padding:32px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#101010;border:1px solid #292929;border-radius:22px;overflow:hidden;">
            <tr>
              <td style="padding:28px 30px 10px;">
                <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8d8d8d;font-weight:700;">manga.kenncode.me</div>
                <div style="font-size:34px;line-height:1;font-weight:900;letter-spacing:-1.5px;margin-top:10px;">MangaFlux</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 30px 30px;">
                <h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;color:#ffffff;">${escapeHtml(input.title)}</h1>
                <p style="margin:0 0 24px;color:#b8b8b8;font-size:15px;line-height:1.7;">${escapeHtml(input.body)}</p>
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:12px;background:#f2f2f2;">
                      <a href="${url}" style="display:inline-block;padding:13px 18px;color:#090909;text-decoration:none;font-weight:800;font-size:14px;">${escapeHtml(input.buttonLabel)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 8px;color:#777;font-size:12px;line-height:1.6;">If the button does not work, open this link:</p>
                <p style="margin:0;word-break:break-all;color:#a8a8a8;font-size:11px;line-height:1.6;">${url}</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #252525;padding:20px 30px;color:#6f6f6f;font-size:11px;line-height:1.6;">
                ${escapeHtml(input.note)}<br>
                Sent by MangaFlux · manga.kenncode.me
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const key = apiKey();
  if (!key) return false;

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      "idempotency-key": input.idempotencyKey
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text
    }),
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) {
    const safeStatus = response.status;
    console.error("Resend send failed", { status: safeStatus });
    return false;
  }

  return true;
}

export async function sendVerificationEmail(
  to: string,
  token: string
) {
  const url =
    `${appOrigin()}/account/verify?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: "Verify your MangaFlux email",
    idempotencyKey: `verify/${token.slice(0, 20)}`,
    html: emailShell({
      preheader: "Verify your email to finish setting up MangaFlux.",
      title: "Verify your email",
      body:
        "Confirm this email address to finish protecting your MangaFlux account and enable reliable account recovery.",
      buttonLabel: "Verify email",
      buttonUrl: url,
      note: "This verification link expires in 24 hours. If you did not create a MangaFlux account, you can ignore this message."
    }),
    text:
      `Verify your MangaFlux email\n\nOpen this link within 24 hours:\n${url}\n\nIf you did not create a MangaFlux account, ignore this email.`
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
) {
  const url =
    `${appOrigin()}/account/reset?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: "Reset your MangaFlux password",
    idempotencyKey: `reset/${token.slice(0, 20)}`,
    html: emailShell({
      preheader: "A password reset was requested for your MangaFlux account.",
      title: "Reset your password",
      body:
        "Use the secure link below to choose a new MangaFlux password. Your existing sessions will be signed out after the reset.",
      buttonLabel: "Reset password",
      buttonUrl: url,
      note: "This reset link expires in 30 minutes and can be used only once. If you did not request it, you can ignore this message."
    }),
    text:
      `Reset your MangaFlux password\n\nOpen this link within 30 minutes:\n${url}\n\nIf you did not request this reset, ignore this email.`
  });
}

export async function sendNewChapterNotificationEmail(
  to: string,
  input: {
    eventId: string;
    mangaTitle: string;
    chapterId: string;
    chapterLabel?: string | null;
    chapterTitle?: string | null;
  }
) {
  const chapter =
    input.chapterLabel?.trim() ||
    input.chapterTitle?.trim() ||
    "New chapter";
  const url =
    `${appOrigin()}/read/${encodeURIComponent(input.chapterId)}`;
  const subject = `${input.mangaTitle}: ${chapter} is available`;

  return sendEmail({
    to,
    subject,
    idempotencyKey: `new-chapter/${input.eventId}`,
    html: emailShell({
      preheader: `A new chapter of ${input.mangaTitle} is available.`,
      title: "New chapter available",
      body: `${input.mangaTitle} · ${chapter} is now available on MangaFlux.`,
      buttonLabel: "Read chapter",
      buttonUrl: url,
      note:
        "You received this because Email notifications are enabled on your MangaFlux account and Alerts are enabled for this manga. You can disable Email notifications from your account settings."
    }),
    text:
      `New chapter available\n\n${input.mangaTitle} · ${chapter}\n\nRead: ${url}\n\nYou can disable Email notifications from your MangaFlux account settings.`
  });
}
