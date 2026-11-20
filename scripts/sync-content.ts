/**
 * Replaces the stored public content with the canonical seeded content.
 * Run with: npx tsx scripts/sync-content.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { seedContent } from "../shared/seedContent";

const DB_PATH = "data/db.json";
const db = JSON.parse(readFileSync(DB_PATH, "utf8"));

// Keep the CV that was uploaded through the admin if it still exists on disk.
const previousCvUrl: string | undefined = db?.content?.contact?.cvUrl;

const content = JSON.parse(JSON.stringify(seedContent));
if (previousCvUrl?.startsWith("/uploads/") && existsSync(`data${previousCvUrl}`)) {
  content.contact.cvUrl = previousCvUrl;
}

db.version = 1;
db.content = content;

writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");
console.log("content synced:", {
  projects: content.projects.length,
  education: content.education.length,
  experiences: content.experiences.length,
  achievements: content.certifications.length,
  skills: content.skills.length,
  cvUrl: content.contact.cvUrl,
});
