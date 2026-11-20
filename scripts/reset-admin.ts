import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const DB_PATH = "data/db.json";
const db = JSON.parse(readFileSync(DB_PATH, "utf8"));

const email = process.env.ADMIN_EMAIL || "talibi.abder@gmail.com";
const password = process.env.ADMIN_PASSWORD || "admin123";

const salt = randomBytes(16).toString("hex");
const passwordHash = scryptSync(password, salt, 64).toString("hex");

db.admin = {
  email: email.trim().toLowerCase(),
  salt,
  passwordHash,
  updatedAt: new Date().toISOString(),
};

writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
console.log(`admin reset: email=${db.admin.email}, password=${password}`);
