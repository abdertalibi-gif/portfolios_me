import express, { type NextFunction, type Request, type Response } from "express";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type {
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
} from "../shared/types";
import {
  createRateLimiter,
  handleLogin,
  handleLogout,
  handleMe,
  invalidateSessionsExcept,
  requireAdminHeader,
  requireAuth,
  sameOriginGuard,
} from "./auth";
import { ROOT_DIR, UPLOADS_DIR } from "./env";
import { getAdminPublic, getDb, persist, setPassword, verifyPassword } from "./store";
import {
  ApiError,
  asArray,
  asBool,
  asDateText,
  asEmail,
  asId,
  asImage,
  asKey,
  asLink,
  asLocalized,
  asPassword,
  asPeriod,
  asTags,
  asText,
  nextOrder,
} from "./validation";

interface AppOptions {
  serveStatic?: boolean;
}

type Handler = (req: Request, res: Response) => void;

const handle = (fn: Handler) => (req: Request, res: Response): void => {
  try {
    fn(req, res);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error("[api]", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

function sorted<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function publicContent(): PortfolioContent {
  const db = getDb();
  return {
    projects: sorted(db.content.projects.filter((project) => project.published)),
    skillCategories: sorted(db.content.skillCategories),
    skills: sorted(db.content.skills),
    education: sorted(db.content.education),
    experiences: sorted(db.content.experiences),
    certifications: sorted(db.content.certifications),
    about: db.content.about,
    contact: db.content.contact,
  };
}

function fullContent(): PortfolioContent {
  const db = getDb();
  return {
    projects: sorted(db.content.projects),
    skillCategories: sorted(db.content.skillCategories),
    skills: sorted(db.content.skills),
    education: sorted(db.content.education),
    experiences: sorted(db.content.experiences),
    certifications: sorted(db.content.certifications),
    about: db.content.about,
    contact: db.content.contact,
  };
}

function validateProject(body: Record<string, unknown>): Omit<Project, "id" | "order" | "createdAt" | "updatedAt"> {
  return {
    title: asLocalized(body.title, "Titre", { max: 160 }),
    description: asLocalized(body.description, "Description", { max: 3000 }),
    tags: asTags(body.tags),
    image: asImage(body.image),
    github: asLink(body.github, "Lien GitHub"),
    demo: asLink(body.demo, "Lien démo"),
    published: asBool(body.published, true),
    featured: asBool(body.featured, false),
  };
}

function validateCategory(
  body: Record<string, unknown>,
  fallbackKey: string,
): Omit<SkillCategory, "id" | "order"> {
  const name = asLocalized(body.name, "Nom de catégorie", { max: 120 });
  return { key: asKey(body.key, fallbackKey), name };
}

function validateSkill(body: Record<string, unknown>): Omit<Skill, "id" | "order"> {
  const categoryId = asText(body.categoryId, "Catégorie", { max: 80 });
  if (!getDb().content.skillCategories.some((category) => category.id === categoryId)) {
    throw new ApiError("Catégorie introuvable");
  }
  return { categoryId, name: asLocalized(body.name, "Compétence", { max: 100 }) };
}

function validateEducation(body: Record<string, unknown>): Omit<EducationItem, "id" | "order"> {
  return {
    degree: asLocalized(body.degree, "Diplôme", { max: 300 }),
    institution: asLocalized(body.institution, "Établissement", { max: 300 }),
    description: body.description ? asLocalized(body.description, "Description", { max: 3000 }) : { en: "", fr: "", de: "", ar: "" },
    period: asPeriod(body.period),
  };
}

function validateExperience(body: Record<string, unknown>): Omit<ExperienceItem, "id" | "order"> {
  return {
    role: asLocalized(body.role, "Poste", { max: 200 }),
    company: asLocalized(body.company, "Entreprise", { max: 200 }),
    location: asLocalized(body.location, "Localisation", { max: 200 }),
    description: asLocalized(body.description, "Description", { max: 3000 }),
    period: asPeriod(body.period),
    employmentType: typeof body.employmentType === "string" ? body.employmentType.trim() : "",
  };
}

function validateCertification(body: Record<string, unknown>): Omit<Certification, "id" | "order"> {
  return {
    title: asLocalized(body.title, "Titre", { max: 240 }),
    issuer: asLocalized(body.issuer, "Organisme", { max: 240 }),
    date: asDateText(body.date, "Date"),
    link: asLink(body.link, "Lien"),
    image: asImage(body.image),
    expirationDate: asDateText(body.expirationDate, "Date d'expiration"),
    credentialId: asText(body.credentialId, "Identifiant de crédit", { max: 100, required: false }),
  };
}

function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export function createApiApp(options: AppOptions = {}): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  app.use(express.json({ limit: "1mb" }));
  app.use(sameOriginGuard);

  app.use(
    "/uploads",
    express.static(UPLOADS_DIR, { maxAge: "1y", immutable: true, index: false, dotfiles: "deny" }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.get(
    "/api/content",
    handle((_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      res.json({ content: publicContent() });
    }),
  );

  const messageLimiter = createRateLimiter(6, 10 * 60 * 1000);
  app.post(
    "/api/messages",
    messageLimiter,
    handle((req, res) => {
      const body = (req.body || {}) as Record<string, unknown>;
      const message: Message = {
        id: randomUUID(),
        name: asText(body.name, "Nom", { max: 120, min: 1 }),
        email: asEmail(body.email, "Email"),
        subject: asText(body.subject, "Sujet", { max: 200, min: 2 }),
        message: asText(body.message, "Message", { max: 5000, min: 5 }),
        read: false,
        createdAt: new Date().toISOString(),
      };
      const db = getDb();
      db.messages.unshift(message);
      persist();
      res.status(201).json({ ok: true, id: message.id });
    }),
  );

  const loginLimiter = createRateLimiter(10, 10 * 60 * 1000);
  app.post("/api/auth/login", loginLimiter, handle(handleLogin));
  app.post("/api/auth/logout", handle(handleLogout));
  app.get("/api/auth/me", handle(handleMe));

  const admin = express.Router();
  admin.use(requireAuth);

  admin.get(
    "/content",
    handle((_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      res.json({ content: fullContent() });
    }),
  );

  admin.get(
    "/stats",
    handle((_req, res) => {
      const db = getDb();
      const messages = [...db.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      res.json({
        projects: db.content.projects.length,
        publishedProjects: db.content.projects.filter((project) => project.published).length,
        skills: db.content.skills.length,
        certifications: db.content.certifications.length,
        experiences: db.content.experiences.length,
        messages: db.messages.length,
        unreadMessages: db.messages.filter((message) => !message.read).length,
        recentMessages: messages.slice(0, 5),
        recentProjects: sorted(db.content.projects).slice(0, 5),
      });
    }),
  );

  admin.get(
    "/messages",
    handle((_req, res) => {
      const messages = [...getDb().messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      res.json({ items: messages });
    }),
  );

  admin.patch(
    "/messages/:id",
    requireAdminHeader,
    handle((req, res) => {
      const message = getDb().messages.find((item) => item.id === req.params.id);
      if (!message) throw new ApiError("Message introuvable", 404);
      if (typeof req.body?.read !== "boolean") throw new ApiError("Statut invalide");
      message.read = req.body.read;
      persist();
      res.json({ item: message });
    }),
  );

  admin.delete(
    "/messages/:id",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const index = db.messages.findIndex((item) => item.id === req.params.id);
      if (index === -1) throw new ApiError("Message introuvable", 404);
      const [removed] = db.messages.splice(index, 1);
      persist();
      res.json({ item: removed });
    }),
  );

  admin.post(
    "/projects",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const now = new Date().toISOString();
      const project: Project = {
        ...validateProject((req.body || {}) as Record<string, unknown>),
        id: randomUUID(),
        order: nextOrder(db.content.projects),
        createdAt: now,
        updatedAt: now,
      };
      db.content.projects.push(project);
      persist();
      res.status(201).json({ item: project });
    }),
  );

  admin.put(
    "/projects/:id",
    requireAdminHeader,
    handle((req, res) => {
      const project = getDb().content.projects.find((item) => item.id === req.params.id);
      if (!project) throw new ApiError("Projet introuvable", 404);
      Object.assign(project, validateProject((req.body || {}) as Record<string, unknown>), {
        updatedAt: new Date().toISOString(),
      });
      persist();
      res.json({ item: project });
    }),
  );

  admin.patch(
    "/projects/:id/publish",
    requireAdminHeader,
    handle((req, res) => {
      const project = getDb().content.projects.find((item) => item.id === req.params.id);
      if (!project) throw new ApiError("Projet introuvable", 404);
      if (typeof req.body?.published !== "boolean") throw new ApiError("Statut invalide");
      project.published = req.body.published;
      project.updatedAt = new Date().toISOString();
      persist();
      res.json({ item: project });
    }),
  );

  admin.delete(
    "/projects/:id",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const index = db.content.projects.findIndex((item) => item.id === req.params.id);
      if (index === -1) throw new ApiError("Projet introuvable", 404);
      const [removed] = db.content.projects.splice(index, 1);
      persist();
      res.json({ item: removed });
    }),
  );

  admin.post(
    "/skill-categories",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const body = (req.body || {}) as Record<string, unknown>;
      const name = asLocalized(body.name, "Nom de catégorie", { max: 120 });
      const draft = validateCategory(body, name.en || name.fr || "categorie");
      if (db.content.skillCategories.some((category) => category.key === draft.key)) {
        throw new ApiError("Cette clé de catégorie existe déjà");
      }
      const category: SkillCategory = {
        ...draft,
        id: randomUUID(),
        order: nextOrder(db.content.skillCategories),
      };
      db.content.skillCategories.push(category);
      persist();
      res.status(201).json({ item: category });
    }),
  );

  admin.put(
    "/skill-categories/:id",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const category = db.content.skillCategories.find((item) => item.id === req.params.id);
      if (!category) throw new ApiError("Catégorie introuvable", 404);
      const body = (req.body || {}) as Record<string, unknown>;
      const name = asLocalized(body.name, "Nom de catégorie", { max: 120 });
      const draft = validateCategory(body, category.key);
      if (db.content.skillCategories.some((item) => item.id !== category.id && item.key === draft.key)) {
        throw new ApiError("Cette clé de catégorie existe déjà");
      }
      Object.assign(category, draft);
      persist();
      res.json({ item: category });
    }),
  );

  admin.delete(
    "/skill-categories/:id",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const index = db.content.skillCategories.findIndex((item) => item.id === req.params.id);
      if (index === -1) throw new ApiError("Catégorie introuvable", 404);
      db.content.skills = db.content.skills.filter((skill) => skill.categoryId !== req.params.id);
      const [removed] = db.content.skillCategories.splice(index, 1);
      persist();
      res.json({ item: removed });
    }),
  );

  admin.post(
    "/skills",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const skill: Skill = {
        ...validateSkill((req.body || {}) as Record<string, unknown>),
        id: randomUUID(),
        order: nextOrder(db.content.skills.filter((item) => item.categoryId === (req.body?.categoryId as string))),
      };
      db.content.skills.push(skill);
      persist();
      res.status(201).json({ item: skill });
    }),
  );

  admin.put(
    "/skills/:id",
    requireAdminHeader,
    handle((req, res) => {
      const skill = getDb().content.skills.find((item) => item.id === req.params.id);
      if (!skill) throw new ApiError("Compétence introuvable", 404);
      Object.assign(skill, validateSkill((req.body || {}) as Record<string, unknown>));
      persist();
      res.json({ item: skill });
    }),
  );

  admin.delete(
    "/skills/:id",
    requireAdminHeader,
    handle((req, res) => {
      const db = getDb();
      const index = db.content.skills.findIndex((item) => item.id === req.params.id);
      if (index === -1) throw new ApiError("Compétence introuvable", 404);
      const [removed] = db.content.skills.splice(index, 1);
      persist();
      res.json({ item: removed });
    }),
  );

  const collections = [
    {
      path: "education",
      items: () => getDb().content.education,
      validate: validateEducation,
    },
    {
      path: "experiences",
      items: () => getDb().content.experiences,
      validate: validateExperience,
    },
    {
      path: "certifications",
      items: () => getDb().content.certifications,
      validate: validateCertification,
    },
  ] as const;

  for (const collection of collections) {
    admin.post(
      `/${collection.path}`,
      requireAdminHeader,
      handle((req, res) => {
        const items = collection.items() as Array<{ id: string; order: number }>;
        const item = {
          ...(collection.validate((req.body || {}) as Record<string, unknown>) as object),
          id: randomUUID(),
          order: nextOrder(items),
        };
        (items as unknown as Array<typeof item>).push(item);
        persist();
        res.status(201).json({ item });
      }),
    );

    admin.put(
      `/${collection.path}/:id`,
      requireAdminHeader,
      handle((req, res) => {
        const items = collection.items() as Array<{ id: string; order: number }>;
        const item = items.find((entry) => entry.id === req.params.id);
        if (!item) throw new ApiError("Élément introuvable", 404);
        Object.assign(item, collection.validate((req.body || {}) as Record<string, unknown>));
        persist();
        res.json({ item });
      }),
    );

    admin.delete(
      `/${collection.path}/:id`,
      requireAdminHeader,
      handle((req, res) => {
        const db = getDb();
        const list = db.content[collection.path] as unknown as Array<{ id: string }>;
        const index = list.findIndex((entry) => entry.id === req.params.id);
        if (index === -1) throw new ApiError("Élément introuvable", 404);
        const [removed] = list.splice(index, 1);
        persist();
        res.json({ item: removed });
      }),
    );
  }

  admin.get(
    "/about",
    handle((_req, res) => res.json({ item: getDb().content.about })),
  );

  admin.put(
    "/about",
    requireAdminHeader,
    handle((req, res) => {
      const body = (req.body || {}) as Record<string, unknown>;
      const focusRaw = asArray(body.focus, "Points de focus", 10);
      const focus: FocusItem[] = focusRaw
        .map((entry) => {
          const item = (entry || {}) as Record<string, unknown>;
          return { id: asId(item.id), text: asLocalized(item.text, "Point de focus", { max: 300, required: false }) };
        })
        .filter((item) => Object.values(item.text).some(Boolean));
      if (focus.length === 0) throw new ApiError("Ajoutez au moins un point de focus");
      const about = {
        description: asLocalized(body.description, "Description", { max: 4000 }),
        focus,
        professionalTitle: asLocalized(body.professionalTitle, "Titre professionnel", { max: 200 }),
        profileImage: asImage(body.profileImage),
      };
      getDb().content.about = about;
      persist();
      res.json({ item: about });
    }),
  );

  admin.get(
    "/contact",
    handle((_req, res) => res.json({ item: getDb().content.contact })),
  );

  admin.put(
    "/contact",
    requireAdminHeader,
    handle((req, res) => {
      const body = (req.body || {}) as Record<string, unknown>;
      const contact: ContactContent = {
        email: asEmail(body.email, "Email"),
        phone: asText(body.phone, "Téléphone", { required: false, max: 60 }),
        location: asText(body.location, "Localisation", { required: false, max: 160 }),
        github: asLink(body.github, "GitHub"),
        linkedin: asLink(body.linkedin, "LinkedIn"),
        cvUrl: asLink(body.cvUrl, "CV"),
      };
      getDb().content.contact = contact;
      persist();
      res.json({ item: contact });
    }),
  );

  admin.post(
    "/uploads",
    requireAdminHeader,
    express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }),
    handle((req, res) => {
      const buffer = req.body as Buffer;
      if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new ApiError("Fichier image requis (JPEG, PNG ou WebP)");
      }
      const extension = detectImageExtension(buffer);
      if (!extension) throw new ApiError("Format d'image non supporté");
      mkdirSync(UPLOADS_DIR, { recursive: true });
      const filename = `${randomUUID()}.${extension}`;
      writeFileSync(join(UPLOADS_DIR, filename), buffer);
      res.status(201).json({ url: `/uploads/${filename}` });
    }),
  );

  admin.put(
    "/account",
    requireAdminHeader,
    handle((req, res) => {
      const body = (req.body || {}) as Record<string, unknown>;
      const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
      const db = getDb();
      if (!verifyPassword(currentPassword, db.admin)) {
        throw new ApiError("Mot de passe actuel incorrect", 401);
      }
      const newEmail = body.email === undefined ? db.admin.email : asEmail(body.email, "Email");
      const newPassword =
        body.newPassword === undefined || body.newPassword === "" ? "" : asPassword(body.newPassword, "Nouveau mot de passe");
      if (newEmail === db.admin.email && !newPassword) {
        throw new ApiError("Aucune modification");
      }
      db.admin.email = newEmail;
      if (newPassword) setPassword(newPassword);
      db.admin.updatedAt = new Date().toISOString();
      persist();
      invalidateSessionsExcept(res.locals.sessionToken as string);
      res.json({ user: getAdminPublic() });
    }),
  );

  app.use("/api/admin", admin);

  if (options.serveStatic) {
    const dist = join(ROOT_DIR, "dist");
    if (existsSync(dist)) {
      app.use(express.static(dist, { index: false, maxAge: "1h" }));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
          next();
          return;
        }
        res.sendFile(join(dist, "index.html"));
      });
    } else {
      app.get("/", (_req, res) => {
        res.status(503).send("Build introuvable. Exécutez `npm run build` puis relancez le serveur.");
      });
    }
  }

  app.use((req, res, next) => {
    if (!options.serveStatic && !req.path.startsWith("/api/") && !req.path.startsWith("/uploads/")) {
      next();
      return;
    }
    res.status(404).json({ error: "Route introuvable" });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: "JSON invalide" });
      return;
    }
    const typed = error as { type?: string; status?: number };
    if (typed?.type === "entity.too.large") {
      res.status(413).json({ error: "Fichier trop volumineux (5 Mo max)" });
      return;
    }
    console.error("[api]", error);
    res.status(500).json({ error: "Erreur serveur" });
  });

  return app;
}
