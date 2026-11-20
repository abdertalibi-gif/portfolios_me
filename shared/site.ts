/**
 * Single source of truth for the public identity of the portfolio.
 * Update here, and the seeded content, contact fallbacks and metadata stay aligned.
 */
export const IDENTITY = {
  name: "Abderrahim Talibi",
  positioning: "Software Engineer | AI & Backend Developer",
  email: "talibi.abder@gmail.com",
  location: "Meknès, Maroc",
  github: "https://github.com/abdertalibi-gif",
  linkedin: "https://www.linkedin.com/in/abderrahim-talibi-576590364",
  university: "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
} as const;

export const GITHUB_URL = IDENTITY.github;
export const LINKEDIN_URL = IDENTITY.linkedin;
export const EMAIL = IDENTITY.email;
