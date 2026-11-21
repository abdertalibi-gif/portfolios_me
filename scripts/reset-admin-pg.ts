/**
 * Réinitialise le compte administrateur dans Neon PostgreSQL.
 *
 * Usage (PowerShell) :
 *   $env:ADMIN_PASSWORD = "VotreMotDePasseFort12+"
 *   $env:ADMIN_EMAIL = "talibi.abder@gmail.com"   # optionnel
 *   npx tsx scripts/reset-admin-pg.ts
 *
 * Prérequis : DATABASE_URL dans .env
 * Ce script met à jour la table `admins` (pas de suppression de données).
 */
import { randomBytes, scryptSync } from "node:crypto";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL manquant. Aucune modification effectuée.");
  process.exit(1);
}

const email = (process.env.ADMIN_EMAIL || "talibi.abder@gmail.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 12) {
  console.error("ADMIN_PASSWORD manquant ou trop court (12 caractères minimum). Aucune modification effectuée.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password as string, salt, 64).toString("hex");

  const existing = await pool.query("SELECT id FROM admins ORDER BY id LIMIT 1");
  if (existing.rows.length === 0) {
    await pool.query(
      "INSERT INTO admins (email, password_hash, salt, updated_at) VALUES ($1, $2, $3, NOW())",
      [email, passwordHash, salt]
    );
    console.log(`Compte administrateur créé pour ${email}.`);
  } else {
    await pool.query(
      "UPDATE admins SET email = $1, password_hash = $2, salt = $3, updated_at = NOW() WHERE id = (SELECT id FROM admins ORDER BY id LIMIT 1)",
      [email, passwordHash, salt]
    );
    console.log(`Mot de passe administrateur mis à jour pour ${email}.`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error("Erreur :", err?.message || err);
  process.exit(1);
});
