import {
  randomBytes,
  scrypt,
  timingSafeEqual
} from "node:crypto";
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import {
  createSession,
  createUser,
  deleteEmailVerificationTokens,
  deletePasswordResetTokens,
  deleteSession,
  deleteUserSessions,
  findUserByEmail,
  getEmailVerificationToken,
  getPasswordResetToken,
  getSessionUser,
  importReaderState,
  markUserEmailVerified,
  replaceEmailVerificationToken,
  replacePasswordResetToken,
  replaceUserSession,
  updateUserPassword,
  updateUserProfile
} from "@mangaflux/db";
import type { MangaFluxDatabase } from "@mangaflux/db";
import {
  getBearerToken,
  hashSessionToken,
  requireAuthProxy
} from "./authSecurity.js";
import { roleForEmail } from "./adminAccess.js";
import {
  isEmailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail
} from "./email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const VERIFY_TTL_MS = 1000 * 60 * 60 * 24;
const RESET_TTL_MS = 1000 * 60 * 30;
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_BYTES = 64;

type LimitHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<unknown>;

type AuthBody = {
  email?: string;
  password?: string;
  readerId?: string;
  token?: string;
};

type ProfileBody = {
  displayName?: string | null;
  avatarDataUrl?: string | null;
  bio?: string | null;
  showPublicActivity?: boolean;
  showJoinedDate?: boolean;
};

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();
  if (
    email.length < 3 ||
    email.length > 254 ||
    !EMAIL_RE.test(email)
  ) {
    return null;
  }

  return email;
}

function validPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 12 &&
    value.length <= 128
  );
}

function validReaderId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function normalizeDisplayName(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return undefined;

  const name = value.trim().replace(/\s+/g, " ");
  if (!name) return null;
  if (name.length < 2 || name.length > 32 || /[\u0000-\u001f\u007f]/.test(name)) {
    return undefined;
  }

  return name;
}

function normalizeBio(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return undefined;

  const bio = value.trim();
  if (!bio) return null;

  if (
    bio.length > 280 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(bio)
  ) {
    return undefined;
  }

  return bio;
}

function normalizeAvatarDataUrl(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("data:image/webp;base64,")) return undefined;
  if (value.length > 280_000) return undefined;

  const encoded = value.slice("data:image/webp;base64,".length);

  try {
    const bytes = Buffer.from(encoded, "base64");
    if (!bytes.length || bytes.length > 200_000) return undefined;
  } catch {
    return undefined;
  }

  return value;
}

function validOpaqueToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 32 &&
    value.length <= 256
  );
}

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_KEY_BYTES,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: 64 * 1024 * 1024
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      }
    );
  });
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    key.toString("base64url")
  ].join("$");
}

async function verifyPassword(
  password: string,
  encoded: string
) {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);

  if (n !== SCRYPT_N || r !== SCRYPT_R || p !== SCRYPT_P) {
    return false;
  }

  let salt: Buffer;
  let expected: Buffer;

  try {
    salt = Buffer.from(parts[4], "base64url");
    expected = Buffer.from(parts[5], "base64url");
  } catch {
    return false;
  }

  if (salt.length !== 16 || expected.length !== SCRYPT_KEY_BYTES) {
    return false;
  }

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

function newOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

async function issueSession(
  db: MangaFluxDatabase,
  userId: string,
  replaceExisting = false
) {
  const token = newOpaqueToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  if (replaceExisting) {
    await replaceUserSession(db, userId, tokenHash, expiresAt);
  } else {
    await createSession(db, userId, tokenHash, expiresAt);
  }

  return { token, expiresAt };
}

async function issueVerification(
  db: MangaFluxDatabase,
  userId: string,
  email: string
) {
  const token = newOpaqueToken();
  await replaceEmailVerificationToken(
    db,
    userId,
    hashSessionToken(token),
    new Date(Date.now() + VERIFY_TTL_MS)
  );

  return sendVerificationEmail(email, token);
}

async function issueReset(
  db: MangaFluxDatabase,
  userId: string,
  email: string
) {
  const token = newOpaqueToken();
  await replacePasswordResetToken(
    db,
    userId,
    hashSessionToken(token),
    new Date(Date.now() + RESET_TTL_MS)
  );

  return sendPasswordResetEmail(email, token);
}

function databaseRequired(
  database: MangaFluxDatabase | null,
  reply: FastifyReply
): database is MangaFluxDatabase {
  if (database) return true;

  reply.code(503).send({
    error: "AUTH_UNAVAILABLE",
    message: "Authentication is temporarily unavailable."
  });
  return false;
}

export async function authenticateSession(
  request: FastifyRequest,
  reply: FastifyReply,
  database: MangaFluxDatabase | null,
  authProxySecret: string
) {
  if (!requireAuthProxy(request, reply, authProxySecret)) return null;
  if (!databaseRequired(database, reply)) return null;

  const token = getBearerToken(request);
  if (!token) {
    reply.code(401).send({
      error: "UNAUTHENTICATED",
      message: "Sign in is required."
    });
    return null;
  }

  const session = await getSessionUser(
    database,
    hashSessionToken(token)
  );

  if (!session) {
    reply.code(401).send({
      error: "UNAUTHENTICATED",
      message: "Your session is invalid or expired."
    });
    return null;
  }

  return session;
}

export function registerAuthRoutes(
  app: FastifyInstance,
  database: MangaFluxDatabase | null,
  authProxySecret: string,
  limits: {
    signup: LimitHandler;
    login: LimitHandler;
    session: LimitHandler;
    email: LimitHandler;
  }
) {
  app.post<{ Body: AuthBody }>(
    "/api/auth/signup",
    { preHandler: limits.signup },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const email = normalizeEmail(request.body?.email);
      const password = request.body?.password;
      const readerId = request.body?.readerId;

      if (!email || !validPassword(password)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message:
            "Use a valid email and a password between 12 and 128 characters."
        });
      }

      if (await findUserByEmail(database, email)) {
        return reply.code(409).send({
          error: "ACCOUNT_EXISTS",
          message: "An account with that email already exists."
        });
      }

      const user = await createUser(
        database,
        email,
        await hashPassword(password)
      );

      if (validReaderId(readerId)) {
        await importReaderState(database, user.id, readerId);
      }

      const emailSent = isEmailConfigured()
        ? await issueVerification(database, user.id, email)
        : false;

      return reply.code(201).send({
        user: {
          ...user,
          role: roleForEmail(user.email)
        },
        verificationRequired: true,
        emailSent,
        message: emailSent
          ? "Check your email to verify your MangaFlux account."
          : "Account created, but verification email is not configured yet."
      });
    }
  );

  app.post<{ Body: AuthBody }>(
    "/api/auth/login",
    { preHandler: limits.login },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const email = normalizeEmail(request.body?.email);
      const password = request.body?.password;
      const readerId = request.body?.readerId;

      if (!email || !validPassword(password)) {
        return reply.code(401).send({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password."
        });
      }

      const user = await findUserByEmail(database, email);

      if (
        !user ||
        !(await verifyPassword(password, user.passwordHash))
      ) {
        return reply.code(401).send({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password."
        });
      }

      if (!user.emailVerifiedAt) {
        return reply.code(403).send({
          error: "EMAIL_NOT_VERIFIED",
          message: "Verify your email before signing in."
        });
      }

      if (validReaderId(readerId)) {
        await importReaderState(database, user.id, readerId);
      }

      const session = await issueSession(database, user.id, true);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatarDataUrl: user.avatarDataUrl,
          emailVerifiedAt: user.emailVerifiedAt,
          createdAt: user.createdAt,
          role: roleForEmail(user.email)
        },
        sessionToken: session.token,
        expiresAt: session.expiresAt.toISOString()
      };
    }
  );

  app.post<{ Body: AuthBody }>(
    "/api/auth/resend-verification",
    { preHandler: limits.email },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const email = normalizeEmail(request.body?.email);
      if (!email) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Enter a valid email."
        });
      }

      const user = await findUserByEmail(database, email);

      if (user && !user.emailVerifiedAt && isEmailConfigured()) {
        await issueVerification(database, user.id, user.email);
      }

      return {
        ok: true,
        message:
          "If that account still needs verification, a new email has been sent."
      };
    }
  );

  app.post<{ Body: AuthBody }>(
    "/api/auth/verify-email",
    { preHandler: limits.email },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const token = request.body?.token;
      if (!validOpaqueToken(token)) {
        return reply.code(400).send({
          error: "INVALID_TOKEN",
          message: "This verification link is invalid or expired."
        });
      }

      const row = await getEmailVerificationToken(
        database,
        hashSessionToken(token)
      );

      if (!row) {
        return reply.code(400).send({
          error: "INVALID_TOKEN",
          message: "This verification link is invalid or expired."
        });
      }

      const user = await markUserEmailVerified(database, row.userId);
      await deleteEmailVerificationTokens(database, row.userId);

      return {
        verified: true,
        user,
        message: "Email verified. You can sign in to MangaFlux."
      };
    }
  );

  app.post<{ Body: AuthBody }>(
    "/api/auth/forgot-password",
    { preHandler: limits.email },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const email = normalizeEmail(request.body?.email);

      if (email) {
        const user = await findUserByEmail(database, email);
        if (user && isEmailConfigured()) {
          await issueReset(database, user.id, user.email);
        }
      }

      return {
        ok: true,
        message:
          "If an account exists for that email, a password reset link has been sent."
      };
    }
  );

  app.post<{ Body: AuthBody }>(
    "/api/auth/reset-password",
    { preHandler: limits.email },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const token = request.body?.token;
      const password = request.body?.password;

      if (!validOpaqueToken(token) || !validPassword(password)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message:
            "Use a valid reset link and a password between 12 and 128 characters."
        });
      }

      const row = await getPasswordResetToken(
        database,
        hashSessionToken(token)
      );

      if (!row) {
        return reply.code(400).send({
          error: "INVALID_TOKEN",
          message: "This password reset link is invalid or expired."
        });
      }

      await updateUserPassword(
        database,
        row.userId,
        await hashPassword(password)
      );
      await Promise.all([
        deletePasswordResetTokens(database, row.userId),
        deleteUserSessions(database, row.userId),
        deleteEmailVerificationTokens(database, row.userId)
      ]);

      return {
        reset: true,
        message: "Password updated. Sign in again with your new password."
      };
    }
  );

  app.get(
    "/api/auth/session",
    { preHandler: limits.session },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session) return;

      return {
        authenticated: true,
        user: {
          id: session.userId,
          email: session.email,
          displayName: session.displayName,
          avatarDataUrl: session.avatarDataUrl,
          bio: session.bio,
          showPublicActivity: session.showPublicActivity,
          showJoinedDate: session.showJoinedDate,
          communityRestricted: session.communityRestricted,
          emailVerifiedAt: session.emailVerifiedAt,
          createdAt: session.createdAt,
          role: roleForEmail(session.email)
        },
        expiresAt: session.expiresAt.toISOString()
      };
    }
  );

  app.put<{ Body: ProfileBody }>(
    "/api/auth/profile",
    {
      preHandler: limits.session,
      bodyLimit: 320 * 1024
    },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      const displayName = normalizeDisplayName(request.body?.displayName);
      const avatarDataUrl = normalizeAvatarDataUrl(
        request.body?.avatarDataUrl
      );
      const bio =
        request.body?.bio === undefined
          ? session.bio ?? null
          : normalizeBio(request.body.bio);
      const showPublicActivity =
        request.body?.showPublicActivity === undefined
          ? session.showPublicActivity ?? true
          : typeof request.body.showPublicActivity === "boolean"
            ? request.body.showPublicActivity
            : undefined;
      const showJoinedDate =
        request.body?.showJoinedDate === undefined
          ? session.showJoinedDate ?? true
          : typeof request.body.showJoinedDate === "boolean"
            ? request.body.showJoinedDate
            : undefined;

      if (
        displayName === undefined ||
        avatarDataUrl === undefined ||
        bio === undefined ||
        showPublicActivity === undefined ||
        showJoinedDate === undefined
      ) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message:
            "Use a 2-32 character display name, a bio up to 280 characters, valid privacy settings, and a small WebP avatar."
        });
      }

      const user = await updateUserProfile(
        database,
        session.userId,
        {
          displayName,
          avatarDataUrl,
          bio,
          showPublicActivity,
          showJoinedDate
        }
      );

      return {
        user: user
          ? {
              ...user,
              role: roleForEmail(user.email)
            }
          : null,
        message: "Profile updated."
      };
    }
  );

  app.post(
    "/api/auth/logout",
    { preHandler: limits.session },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const token = getBearerToken(request);
      if (token) {
        await deleteSession(database, hashSessionToken(token));
      }

      return { ok: true };
    }
  );
}
