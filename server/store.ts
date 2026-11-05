import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { AdminUser, Message, PortfolioContent } from "../shared/types";
import { seedContent } from "../shared/seedContent";
import { DATA_DIR, ROOT_DIR } from "./env";

interface AdminRecord {
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

const DB_PATH = `${DATA_DIR}/db.json`;

let database: Database | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let generatedPassword: string | null = null;

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, admin: AdminRecord): boolean {
  const candidate = Buffer.from(hashPassword(password, admin.salt), "hex");
  const stored = Buffer.from(admin.passwordHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export function setPassword(password: string): void {
  const db = getDb();
  const salt = randomBytes(16).toString("hex");
  db.admin.salt = salt;
  db.admin.passwordHash = hashPassword(password, salt);
  db.admin.updatedAt = new Date().toISOString();
  persist();
}

export function getAdminPublic(): AdminUser {
  const db = getDb();
  return { email: db.admin.email, updatedAt: db.admin.updatedAt };
}

function createAdminRecord(): AdminRecord {
  const email = (process.env.ADMIN_EMAIL || "admin@talibi.me").trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  let password = envPassword && envPassword.length >= 8 ? envPassword : "";
  if (!password) {
    password = `AT-Admin-${randomBytes(9).toString("base64url")}`;
    generatedPassword = password;
  }
  const salt = randomBytes(16).toString("hex");
  return {
    email,
    salt,
    passwordHash: hashPassword(password, salt),
    updatedAt: new Date().toISOString(),
  };
}

function seedDatabase(): Database {
  return {
    version: 1,
    admin: createAdminRecord(),
    content: structuredClone(seedContent),
    messages: [],
  };
}

function loadDatabase(): Database {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(`${DATA_DIR}/uploads`, { recursive: true });

  if (!existsSync(DB_PATH)) {
    const fresh = seedDatabase();
    writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  }

  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
    if (!parsed || typeof parsed !== "object" || !parsed.content || !parsed.admin) {
      throw new Error("Invalid database structure");
    }
    // Merge newly added top-level keys without overwriting existing data.
    const fallback = seedDatabase();
    const merged: Database = {
      ...fallback,
      ...parsed,
      content: {
        ...fallback.content,
        ...parsed.content,
        about: { ...fallback.content.about, ...(parsed.content.about || {}) },
        contact: { ...fallback.content.contact, ...(parsed.content.contact || {}) },
      },
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
    return merged;
  } catch (error) {
    const backup = `${DB_PATH}.corrupt-${Date.now()}.json`;
    try {
      renameSync(DB_PATH, backup);
      console.error(`[store] Base de données illisible, sauvegarde créée: ${backup}`);
    } catch {
      console.error("[store] Base de données illisible et sauvegarde impossible.", error);
    }
    const fresh = seedDatabase();
    writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), "utf8");
    return fresh;
  }
}

export function getDb(): Database {
  if (!database) {
    database = loadDatabase();
    if (generatedPassword) {
      console.warn(
        `[admin] Mot de passe administrateur généré (affiché une seule fois): ${generatedPassword}\n` +
          `[admin] Changez-le depuis /admin/settings ou définissez ADMIN_PASSWORD dans .env`,
      );
      generatedPassword = null;
      persist();
    }
  }
  return database;
}

export function persist(): void {
  const snapshot = JSON.stringify(getDb(), null, 2);
  writeQueue = writeQueue
    .then(() => {
      mkdirSync(DATA_DIR, { recursive: true });
      const tmp = `${DB_PATH}.tmp`;
      writeFileSync(tmp, snapshot, "utf8");
      renameSync(tmp, DB_PATH);
    })
    .catch((error) => {
      console.error("[store] Échec de sauvegarde:", error);
    });
}

export function projectRoot(): string {
  return ROOT_DIR;
}
