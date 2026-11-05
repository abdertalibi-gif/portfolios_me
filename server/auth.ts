import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { COOKIE_SECURE, SESSION_TTL_MS } from "./env";
import { getAdminPublic, getDb, verifyPassword } from "./store";

const COOKIE_NAME = "at_admin_session";
const sessions = new Map<string, { email: string; expires: number }>();

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function setSessionCookie(res: Response, token: string): void {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
  ];
  if (COOKIE_SECURE) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res: Response): void {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0"];
  if (COOKIE_SECURE) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function getToken(req: Request): string | null {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  return token || null;
}

function getValidSession(req: Request): { email: string; token: string } | null {
  const token = getToken(req);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { email: session.email, token };
}

export function createSession(email: string): string {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { email, expires: Date.now() + SESSION_TTL_MS });
  return token;
}

export function destroySession(token: string | null): void {
  if (token) sessions.delete(token);
}

export function invalidateSessionsExcept(token: string | null): void {
  for (const key of sessions.keys()) {
    if (key !== token) sessions.delete(key);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getValidSession(req);
  if (!session) {
    clearSessionCookie(res);
    res.status(401).json({ error: "Authentification requise" });
    return;
  }
  res.locals.adminEmail = session.email;
  res.locals.sessionToken = session.token;
  next();
}

export function requireAdminHeader(req: Request, res: Response, next: NextFunction): void {
  if (req.get("x-admin-request") !== "1") {
    res.status(403).json({ error: "Requête non autorisée" });
    return;
  }
  next();
}

export function sameOriginGuard(req: Request, res: Response, next: NextFunction): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }
  const origin = req.get("origin");
  if (!origin) {
    next();
    return;
  }
  try {
    const host = new URL(origin).host;
    if (host !== req.get("host")) {
      res.status(403).json({ error: "Origine non autorisée" });
      return;
    }
    next();
  } catch {
    res.status(403).json({ error: "Origine invalide" });
  }
}

interface Bucket {
  count: number;
  reset: number;
}

export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip || "unknown"}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.reset < now) {
      buckets.set(key, { count: 1, reset: now + windowMs });
      next();
      return;
    }
    if (bucket.count >= limit) {
      res.status(429).json({ error: "Trop de tentatives. Réessayez plus tard." });
      return;
    }
    bucket.count += 1;
    next();
  };
}

export function handleLogin(req: Request, res: Response): void {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }
  const db = getDb();
  const admin = db.admin;
  if (email !== admin.email.toLowerCase() || !verifyPassword(password, admin)) {
    res.status(401).json({ error: "Identifiants incorrects" });
    return;
  }
  const previous = getToken(req);
  destroySession(previous);
  const token = createSession(admin.email);
  setSessionCookie(res, token);
  res.json({ user: getAdminPublic() });
}

export function handleLogout(req: Request, res: Response): void {
  const token = getToken(req);
  destroySession(token);
  clearSessionCookie(res);
  res.json({ ok: true });
}

export function handleMe(_req: Request, res: Response): void {
  const session = getValidSession(_req);
  if (!session) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  res.json({ user: getAdminPublic() });
}

export function currentSession(req: Request): { email: string; token: string } | null {
  return getValidSession(req);
}

export function setSessionForEmail(res: Response, email: string): string {
  const token = createSession(email);
  setSessionCookie(res, token);
  return token;
}
