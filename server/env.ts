import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export const ROOT_DIR = process.cwd();
// Sur Vercel, le système de fichiers du projet est en lecture seule : on utilise /tmp (éphémère).
export const DATA_DIR = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : process.env.VERCEL
    ? "/tmp/portfolio-data"
    : `${ROOT_DIR}/data`;
export const UPLOADS_DIR = `${DATA_DIR}/uploads`;
export const SESSION_TTL_MS = Number(process.env.SESSION_TTL_HOURS || 8) * 60 * 60 * 1000;
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";