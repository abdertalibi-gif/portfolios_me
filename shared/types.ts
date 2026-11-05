export const LANGS = ["en", "fr", "de", "ar"] as const;
export type Lang = (typeof LANGS)[number];

export type LocalizedText = Record<Lang, string>;

export interface Project {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  tags: string[];
  image: string;
  github: string;
  demo: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  key: string;
  name: LocalizedText;
  order: number;
}

export interface Skill {
  id: string;
  categoryId: string;
  name: LocalizedText;
  order: number;
}

export interface EducationItem {
  id: string;
  degree: LocalizedText;
  institution: LocalizedText;
  period: string;
  order: number;
}

export interface ExperienceItem {
  id: string;
  role: LocalizedText;
  company: LocalizedText;
  description: LocalizedText;
  period: string;
  order: number;
}

export interface Certification {
  id: string;
  title: LocalizedText;
  issuer: LocalizedText;
  date: string;
  link: string;
  image: string;
  order: number;
}

export interface FocusItem {
  id: string;
  text: LocalizedText;
}

export interface AboutContent {
  description: LocalizedText;
  focus: FocusItem[];
}

export interface ContactContent {
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  cvUrl: string;
}

export interface PortfolioContent {
  projects: Project[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  education: EducationItem[];
  experiences: ExperienceItem[];
  certifications: Certification[];
  about: AboutContent;
  contact: ContactContent;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  projects: number;
  publishedProjects: number;
  skills: number;
  certifications: number;
  experiences: number;
  messages: number;
  unreadMessages: number;
  recentMessages: Message[];
  recentProjects: Project[];
}

export interface AdminUser {
  email: string;
  updatedAt: string;
}

export const emptyLocalized = (): LocalizedText => ({ en: "", fr: "", de: "", ar: "" });

export function pickLocalized(value: LocalizedText | undefined, lang: string): string {
  if (!value) return "";
  const base = (lang || "en").split("-")[0] as Lang;
  return value[base] || value.en || value.fr || value.de || value.ar || "";
}

export function normalizeLang(lang: string | undefined): Lang {
  const base = (lang || "en").split("-")[0];
  return (LANGS as readonly string[]).includes(base) ? (base as Lang) : "en";
}
