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
  deleteSession,
  findUserByEmail,
  getSessionUser,
  importReaderState
} from "@mangaflux/db";
import type { MangaFluxDatabase } from "@mangaflux/db";
import {
  getBearerToken,
  hashSessionToken,
  requireAuthProxy
} from "./authSecurity.js";

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
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

function validPassword(value: unknown) {
  return (
    typeof value === "string" &&
    value.length >= 12 &&
    value.length <= 128
  );
}

function validReaderId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
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

  if (
    n !== SCRYPT_N ||
    r !== SCRYPT_R ||
    p !== SCRYPT_P
  ) {
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

  if (
    salt.length !== 16 ||
    expected.length !== SCRYPT_KEY_BYTES
  ) {
    return false;
  }

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

async function issueSession(
  db: MangaFluxDatabase,
  userId: string
) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await createSession(db, userId, tokenHash, expiresAt);

  return {
    token,
    expiresAt
  };
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

      const passwordHash = await hashPassword(password);
      const user = await createUser(
        database,
        email,
        passwordHash
      );

      if (validReaderId(readerId)) {
        await importReaderState(database, user.id, readerId);
      }

      const session = await issueSession(database, user.id);

      return reply.code(201).send({
        user,
        sessionToken: session.token,
        expiresAt: session.expiresAt.toISOString()
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

      if (!email || typeof password !== "string") {
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

      if (validReaderId(readerId)) {
        await importReaderState(database, user.id, readerId);
      }

      const session = await issueSession(database, user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        },
        sessionToken: session.token,
        expiresAt: session.expiresAt.toISOString()
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
          createdAt: session.createdAt
        },
        expiresAt: session.expiresAt.toISOString()
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
        await deleteSession(
          database,
          hashSessionToken(token)
        );
      }

      return { ok: true };
    }
  );
}
