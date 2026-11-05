import { randomUUID } from "node:crypto";
import { LANGS, type Lang, type LocalizedText } from "../shared/types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface TextOptions {
  required?: boolean;
  max?: number;
  min?: number;
}

export function asText(value: unknown, field: string, options: TextOptions = {}): string {
  const { required = true, max = 2000, min = 0 } = options;
  if (value === undefined || value === null) {
    if (required) throw new ApiError(`${field} est requis`);
    return "";
  }
  if (typeof value !== "string") throw new ApiError(`${field} doit être du texte`);
  const trimmed = value.trim();
  if (required && trimmed.length < Math.max(1, min)) throw new ApiError(`${field} est requis`);
  if (trimmed.length > max) throw new ApiError(`${field} ne doit pas dépasser ${max} caractères`);
  return trimmed;
}

export function asLocalized(value: unknown, field: string, options: TextOptions = {}): LocalizedText {
  if (!value || typeof value !== "object") throw new ApiError(`${field} est requis`);
  const source = value as Record<string, unknown>;
  const result = {} as LocalizedText;
  let filled = 0;
  for (const lang of LANGS) {
    const raw = source[lang];
    const text = typeof raw === "string" ? raw.trim() : "";
    if (text.length > (options.max ?? 3000)) {
      throw new ApiError(`${field} (${lang}) ne doit pas dépasser ${options.max ?? 3000} caractères`);
    }
    if (text) filled += 1;
    result[lang as Lang] = text;
  }
  if (options.required !== false && filled === 0) throw new ApiError(`${field} doit contenir au moins une langue`);
  return result;
}

export function asEmail(value: unknown, field = "Email"): string {
  const email = asText(value, field, { max: 254 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new ApiError(`${field} invalide`);
  return email;
}

export function asLink(value: unknown, field: string, options: { required?: boolean } = {}): string {
  const { required = false } = options;
  if (value === undefined || value === null || value === "") {
    if (required) throw new ApiError(`${field} est requis`);
    return "";
  }
  if (typeof value !== "string") throw new ApiError(`${field} doit être du texte`);
  const link = value.trim();
  if (link.length > 600) throw new ApiError(`${field} est trop long`);
  if (link === "#") return link;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  if (/^https?:\/\/[^\s]+$/i.test(link) || /^mailto:[^\s]+$/i.test(link)) return link;
  throw new ApiError(`${field} doit être une URL http(s), mailto ou un chemin relatif`);
}

export function asImage(value: unknown, field = "Image"): string {
  if (value === undefined || value === null || value === "") return "";
  const link = asLink(value, field);
  if (link && !link.startsWith("/") && !/^https?:\/\//i.test(link)) {
    throw new ApiError(`${field} doit être une image http(s) ou un fichier importé`);
  }
  return link;
}

export function asTags(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ApiError("Les tags doivent être une liste");
  const tags = value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean)
    .slice(0, 12);
  for (const tag of tags) {
    if (tag.length > 40) throw new ApiError("Chaque tag doit faire moins de 40 caractères");
  }
  return Array.from(new Set(tags));
}

export function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function asArray(value: unknown, field: string, max: number): unknown[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ApiError(`${field} doit être une liste`);
  if (value.length > max) throw new ApiError(`${field} contient trop d'éléments (${max} max)`);
  return value;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function asKey(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value.trim() : "";
  const key = slugify(raw || fallback);
  if (!key) throw new ApiError("La clé de catégorie est requise");
  if (!/^[a-z0-9-]{2,40}$/.test(key)) throw new ApiError("Clé de catégorie invalide");
  return key;
}

export function asId(value: unknown): string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : randomUUID();
}

export function asDateText(value: unknown, field: string): string {
  return asText(value, field, { required: false, max: 80 });
}

export function asPeriod(value: unknown): string {
  return asText(value, "Période", { required: false, max: 80 });
}

export function asPassword(value: unknown, field = "Mot de passe"): string {
  const password = asText(value, field, { max: 200, min: 8 });
  if (password.length < 8) throw new ApiError(`${field} doit contenir au moins 8 caractères`);
  return password;
}

export function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order || 0), 0) + 1;
}
