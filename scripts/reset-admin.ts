import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Réinitialise le compte administrateur local. Aucun mot de passe par défaut n'est utilisé.
// Usage (PowerShell) : $env:ADMIN_PASSWORD="..." ; npx tsx scripts/reset-admin.ts
const DB_PATH = "data/db.json";
const password = process.env.ADMIN_PASSWORD;
const email = (process.env.ADMIN_EMAIL || "talibi.abder@gmail.com").trim().toLowerCase();

if (!password || password.length < 12) {
  console.error("ADMIN_PASSWORD manquant ou trop court (12 caractères minimum). Aucune modification effectuée.");
  process.exit(1);
}
if (!email) {
  console.error("ADMIN_EMAIL manquant. Aucune modification effectuée.");
  process.exit(1);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
const salt = randomBytes(16).toString("hex");
const passwordHash = scryptSync(password, salt, 64).toString("hex");

db.admin = { email, salt, passwordHash, updatedAt: new Date().toISOString() };
writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
console.log(`Compte administrateur mis à jour pour ${email}. Le mot de passe n'est pas affiché.`);