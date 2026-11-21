/**
 * Storage Layer - PostgreSQL (Neon) backed.
 *
 * Source de vérité : Neon PostgreSQL (tables admins, admin_sessions,
 * portfolio_content, contact_messages).
 *
 * L'interface synchrone (getDb/persist) est conservée pour ne pas réécrire
 * toutes les routes de server/app.ts : un cache en mémoire est hydraté depuis
 * PostgreSQL au démarrage (cold start) et les écritures sont persistées en async.
 */
import { Pool } from "pg";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { randomUUID } from "node:crypto";
import type { AdminUser, Message, PortfolioContent } from "../shared/types";
import { seedContent } from "../shared/seedContent";
import { ROOT_DIR, UPLOADS_DIR, DATA_DIR } from "./env";

export interface AdminRecord {
  email: string;
  passwordHash: string;
  salt: string;
  updatedAt: string;
}

export interface Database {
  version: 1;
  admin: AdminRecord;
  content: PortfolioContent;
  messages: Message[];
}

// ---------- Pool PostgreSQL (lazy, ne plante pas si DATABASE_URL absent) ----------
let pool: Pool | null = null;
function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
    pool.on("error", (err) => console.error("[pg] pool error", err));
  }
  return pool;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

// ---------- Hash mot de passe (scrypt) ----------
export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, admin: { email?: string; salt: string; passwordHash: string }): boolean {
  if (!admin || !admin.passwordHash || !admin.salt) return false;
  try {
    const candidate = Buffer.from(scryptSync(password, admin.salt, 64).toString("hex"), "hex");
    const stored = Buffer.from(admin.passwordHash, "hex");
    if (candidate.length !== stored.length) return false;
    return timingSafeEqual(candidate, stored);
  } catch {
    return false;
  }
}

// ---------- Cache en mémoire ----------
interface CacheShape {
  admin: AdminRecord;
  content: PortfolioContent;
  messages: Message[];
  loaded: boolean;
  loading: Promise<void> | null;
}
const cache: CacheShape = {
  admin: {
    email: process.env.ADMIN_EMAIL || "talibi.abder@gmail.com",
    passwordHash: "",
    salt: "",
    updatedAt: new Date().toISOString(),
  },
  content: structuredClone(seedContent),
  messages: [],
  loaded: false,
  loading: null,
};

async function loadFromDb(): Promise<void> {
  const p = getPool();
  if (!p) {
    // Pas de DATABASE_URL : on garde le seed (mode dégradé, pas de persistance)
    cache.loaded = true;
    return;
  }
  try {
    // Admin
    const adminRes = await p.query("SELECT email, password_hash, salt, updated_at FROM admins ORDER BY id LIMIT 1");
    if (adminRes.rows.length > 0) {
      const r = adminRes.rows[0];
      cache.admin = {
        email: r.email,
        passwordHash: r.password_hash,
        salt: r.salt,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    } else {
      // Créer l'admin initial si la table est vide
      const email = (process.env.ADMIN_EMAIL || "talibi.abder@gmail.com").trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || "";
      if (password && password.length >= 8) {
        const salt = randomBytes(16).toString("hex");
        const passwordHash = scryptSync(password, salt, 64).toString("hex");
        await p.query(
          "INSERT INTO admins (email, password_hash, salt, updated_at) VALUES ($1, $2, $3, NOW())",
          [email, passwordHash, salt]
        );
        cache.admin = { email, passwordHash, salt, updatedAt: new Date().toISOString() };
      }
    }

    // Contenu
    const contentRes = await p.query("SELECT content FROM portfolio_content WHERE id = 'main' LIMIT 1");
    if (contentRes.rows.length > 0 && contentRes.rows[0].content) {
      cache.content = contentRes.rows[0].content as PortfolioContent;
    }

    // Messages
    const msgRes = await p.query(
      "SELECT id, name, email, subject, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC"
    );
    cache.messages = msgRes.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      read: !!row.is_read,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[store] loadFromDb error:", err);
  } finally {
    cache.loaded = true;
  }
}

// Hydratation au démarrage (non bloquante)
cache.loading = loadFromDb();

export async function ensureLoaded(): Promise<void> {
  if (cache.loading) await cache.loading;
  if (!cache.loaded) {
    cache.loading = loadFromDb();
    await cache.loading;
  }
}

// ---------- Interface synchrone pour app.ts/auth.ts ----------
export function getDb(): Database {
  return {
    version: 1,
    admin: cache.admin,
    content: cache.content,
    messages: cache.messages,
  };
}

export function getAdminPublic(): AdminUser {
  return { email: cache.admin.email, updatedAt: cache.admin.updatedAt };
}

export function setPassword(password: string): { email: string; salt: string; passwordHash: string } | null {
  if (!cache.admin) return null;
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, salt, 64).toString("hex");
  cache.admin = { ...cache.admin, salt, passwordHash, updatedAt: new Date().toISOString() };

  const p = getPool();
  if (p) {
    p.query(
      "UPDATE admins SET password_hash = $1, salt = $2, updated_at = NOW() WHERE email = $3",
      [passwordHash, salt, cache.admin.email]
    ).catch((e) => console.error("[store] setPassword error", e));
  }
  return { email: cache.admin.email, salt, passwordHash };
}

export function verifyPasswordExport(password: string, admin: { email?: string; salt: string; passwordHash: string }): boolean {
  return verifyPassword(password, admin);
}

// Persist (écrit le contenu + messages en PostgreSQL)
export function persist(): void {
  const p = getPool();
  if (!p) return;
  const snapshot = {
    content: cache.content,
    messages: cache.messages,
  };
  p.query(
    "INSERT INTO portfolio_content (id, content, updated_at) VALUES ('main', $1, NOW()) ON CONFLICT (id) DO UPDATE SET content = $1, updated_at = NOW()",
    [JSON.stringify(snapshot.content)]
  ).catch((e) => console.error("[store] persist content error", e));

  // Messages : upsert simple (insert nouveaux, update is_read)
  for (const m of cache.messages) {
    p.query(
      `INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET is_read = $6`,
      [m.id, m.name, m.email, m.subject, m.message, m.read, m.createdAt]
    ).catch((e) => console.error("[store] persist message error", e));
  }
}

// ---------- Sessions admin (PostgreSQL, pas de Map permanente) ----------
const memorySessions = new Map<string, { email: string; expires: number }>();

export function syncSessionToDB(token: string, email: string, ttlMs: number): void {
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  memorySessions.set(token, { email, expires: Date.now() + ttlMs });
  const p = getPool();
  if (p) {
    p.query(
      "INSERT INTO admin_sessions (id, token, email, expires_at) VALUES ($1, $2, $3, $4) ON CONFLICT (token) DO UPDATE SET expires_at = $4, email = $3",
      [token, token, email, expiresAt]
    ).catch((e) => console.error("[store] syncSession error", e));
  }
}

export function removeSessionFromDB(token: string): void {
  memorySessions.delete(token);
  const p = getPool();
  if (p) {
    p.query("DELETE FROM admin_sessions WHERE token = $1", [token]).catch((e) => console.error("[store] removeSession error", e));
  }
}

export function getSessions(): Map<string, { email: string; expires: number }> {
  return memorySessions;
}

// Hydrate sessions depuis PG au démarrage
export async function loadSessionsFromDb(): Promise<void> {
  const p = getPool();
  if (!p) return;
  try {
    const result = await p.query("SELECT token, email, expires_at FROM admin_sessions");
    for (const row of result.rows) {
      const expires = new Date(row.expires_at).getTime();
      if (expires > Date.now()) {
        memorySessions.set(row.token, { email: row.email, expires });
      }
    }
  } catch (e) {
    console.error("[store] loadSessions error", e);
  }
}

// ---------- Messages helpers ----------
export function getContactMessagesDB(): Message[] {
  return cache.messages;
}

export function addContactMessageDB(name: string, email: string, subject: string, message: string): string {
  const id = randomUUID();
  const msg: Message = { id, name, email, subject, message, read: false, createdAt: new Date().toISOString() };
  cache.messages.unshift(msg);
  const p = getPool();
  if (p) {
    p.query(
      "INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at) VALUES ($1,$2,$3,$4,$5,false,$6)",
      [id, name, email, subject, message, msg.createdAt]
    ).catch((e) => console.error("[store] addContactMessage error", e));
  }
  return id;
}

export function updateMessageReadDB(messageId: string, read: boolean): void {
  const m = cache.messages.find((x) => x.id === messageId);
  if (m) m.read = read;
  const p = getPool();
  if (p) {
    p.query("UPDATE contact_messages SET is_read = $1 WHERE id = $2", [read, messageId]).catch((e) => console.error("[store] updateMessageRead error", e));
  }
}

export function deleteMessageDB(messageId: string): void {
  cache.messages = cache.messages.filter((x) => x.id !== messageId);
  const p = getPool();
  if (p) {
    p.query("DELETE FROM contact_messages WHERE id = $1", [messageId]).catch((e) => console.error("[store] deleteMessage error", e));
  }
}

// ---------- Compat exports ----------
export { hashPassword };

// Export par défaut pour compatibilité avec l'ancien code
export default {
  version: 1 as const,
  get admin() { return cache.admin; },
  get content() { return cache.content; },
  get messages() { return cache.messages; },
};

// Note: UPLOADS_DIR / DATA_DIR sont ré-exportés pour compatibilité
export { UPLOADS_DIR, DATA_DIR };
