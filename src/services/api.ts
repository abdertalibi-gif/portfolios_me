import type {
  AdminStats,
  AdminUser,
  Certification,
  ContactContent,
  EducationItem,
  ExperienceItem,
  FocusItem,
  Message,
  PortfolioContent,
  Project,
  Skill,
  SkillCategory,
} from "../../shared/types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init.method && init.method !== "GET" && !headers.has("X-Admin-Request")) {
    headers.set("X-Admin-Request", "1");
  }

  const response = await fetch(path, { credentials: "same-origin", ...init, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/me") {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    throw new ApiError((data as { error?: string } | null)?.error || "Une erreur est survenue", response.status);
  }

  return data as T;
}

export type ProjectInput = Pick<Project, "title" | "description" | "tags" | "image" | "github" | "demo" | "published">;
export type SkillCategoryInput = Pick<SkillCategory, "key" | "name">;
export type SkillInput = Pick<Skill, "categoryId" | "name">;
export type EducationInput = Pick<EducationItem, "degree" | "institution" | "period">;
export type ExperienceInput = Pick<ExperienceItem, "role" | "company" | "description" | "period">;
export type CertificationInput = Pick<Certification, "title" | "issuer" | "date" | "link" | "image">;
export type AboutInput = { description: PortfolioContent["about"]["description"]; focus: FocusItem[] };

export const api = {
  login: (email: string, password: string) =>
    request<{ user: AdminUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: AdminUser }>("/api/auth/me"),

  getPublicContent: () => request<{ content: PortfolioContent }>("/api/content", { cache: "no-store" }),
  sendMessage: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ ok: boolean }>("/api/messages", { method: "POST", body: JSON.stringify(payload) }),

  getAdminContent: () => request<{ content: PortfolioContent }>("/api/admin/content"),
  getStats: () => request<AdminStats>("/api/admin/stats"),
  getMessages: () => request<{ items: Message[] }>("/api/admin/messages"),
  updateMessage: (id: string, read: boolean) =>
    request<{ item: Message }>(`/api/admin/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ read }),
    }),
  deleteMessage: (id: string) => request<{ item: Message }>(`/api/admin/messages/${id}`, { method: "DELETE" }),

  createProject: (payload: ProjectInput) =>
    request<{ item: Project }>("/api/admin/projects", { method: "POST", body: JSON.stringify(payload) }),
  updateProject: (id: string, payload: ProjectInput) =>
    request<{ item: Project }>(`/api/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProject: (id: string) =>
    request<{ item: Project }>(`/api/admin/projects/${id}`, { method: "DELETE" }),
  publishProject: (id: string, published: boolean) =>
    request<{ item: Project }>(`/api/admin/projects/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }),

  createCategory: (payload: SkillCategoryInput) =>
    request<{ item: SkillCategory }>("/api/admin/skill-categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCategory: (id: string, payload: SkillCategoryInput) =>
    request<{ item: SkillCategory }>(`/api/admin/skill-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCategory: (id: string) =>
    request<{ item: SkillCategory }>(`/api/admin/skill-categories/${id}`, { method: "DELETE" }),

  createSkill: (payload: SkillInput) =>
    request<{ item: Skill }>("/api/admin/skills", { method: "POST", body: JSON.stringify(payload) }),
  updateSkill: (id: string, payload: SkillInput) =>
    request<{ item: Skill }>(`/api/admin/skills/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSkill: (id: string) =>
    request<{ item: Skill }>(`/api/admin/skills/${id}`, { method: "DELETE" }),

  createEducation: (payload: EducationInput) =>
    request<{ item: EducationItem }>("/api/admin/education", { method: "POST", body: JSON.stringify(payload) }),
  updateEducation: (id: string, payload: EducationInput) =>
    request<{ item: EducationItem }>(`/api/admin/education/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteEducation: (id: string) =>
    request<{ item: EducationItem }>(`/api/admin/education/${id}`, { method: "DELETE" }),

  createExperience: (payload: ExperienceInput) =>
    request<{ item: ExperienceItem }>("/api/admin/experiences", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateExperience: (id: string, payload: ExperienceInput) =>
    request<{ item: ExperienceItem }>(`/api/admin/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteExperience: (id: string) =>
    request<{ item: ExperienceItem }>(`/api/admin/experiences/${id}`, { method: "DELETE" }),

  createCertification: (payload: CertificationInput) =>
    request<{ item: Certification }>("/api/admin/certifications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCertification: (id: string, payload: CertificationInput) =>
    request<{ item: Certification }>(`/api/admin/certifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCertification: (id: string) =>
    request<{ item: Certification }>(`/api/admin/certifications/${id}`, { method: "DELETE" }),

  updateAbout: (payload: AboutInput) =>
    request<{ item: PortfolioContent["about"] }>("/api/admin/about", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateContact: (payload: ContactContent) =>
    request<{ item: ContactContent }>("/api/admin/contact", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  uploadImage: async (file: File): Promise<string> => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new ApiError("Format non supporté. Utilisez JPEG, PNG ou WebP.", 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError("L'image ne doit pas dépasser 5 Mo.", 400);
    }
    const data = await request<{ url: string }>("/api/admin/uploads", {
      method: "POST",
      headers: { "Content-Type": file.type, "X-Admin-Request": "1" },
      body: file,
    });
    return data.url;
  },

  updateAccount: (payload: { currentPassword: string; email?: string; newPassword?: string }) =>
    request<{ user: AdminUser }>("/api/admin/account", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
