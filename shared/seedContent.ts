import type {
  AboutContent,
  Certification,
  ContactContent,
  EducationItem,
  ExperienceItem,
  PortfolioContent,
  Project,
  Skill,
  SkillCategory,
} from "./types";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "./site";

const loc = (en: string, fr: string, de: string, ar: string) => ({ en, fr, de, ar });
const now = new Date().toISOString();

export const seedProjects: Project[] = [
  {
    id: "proj-presenceqr",
    title: loc("PrésenceQR", "PrésenceQR", "PrésenceQR", "PrésenceQR"),
    description: loc(
      "QR-code attendance platform: Django REST Framework API, real-time tracking over WebSockets, PostgreSQL, proximity validation, Excel session reports and a Flutter mobile app.",
      "Plateforme de présence par QR code : API Django REST Framework, suivi temps réel via WebSockets, PostgreSQL, validation par proximité, rapports de session Excel et application mobile Flutter.",
      "QR-Code-Anwesenheitsplattform: Django-REST-API, Echtzeit-Tracking über WebSockets, PostgreSQL, Näherungsvalidierung, Excel-Berichte und Flutter-App.",
      "منصة حضور عبر رمز QR: واجهة Django REST، تتبع فوري عبر WebSockets، PostgreSQL، التحقق من القرب، تقارير Excel وتطبيق Flutter.",
    ),
    tags: ["Django", "DRF", "PostgreSQL", "WebSockets", "Flutter"],
    image: "/assets/images/project_attendance_3d_light_1793556805155.jpg",
    github: "https://github.com/abdertalibi-gif/Qr_code_pfe-",
    demo: "",
    published: true,
    featured: true,
    order: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-agent-auditor",
    title: loc(
      "Agent Readiness Auditor",
      "Agent Readiness Auditor",
      "Agent Readiness Auditor",
      "Agent Readiness Auditor",
    ),
    description: loc(
      "SaaS that audits how ready a website is to be discovered and understood by AI agents: safe crawler, ~60 deterministic checks, weighted score across 8 categories, PDF report and optional grounded LLM explanations.",
      "SaaS qui évalue la capacité d'un site à être découvert et compris par des agents IA : crawler sécurisé, ~60 contrôles déterministes, score pondéré sur 8 catégories, rapport PDF et explications LLM optionnelles.",
      "SaaS, das bewertet, wie gut eine Website von KI-Agenten erkannt und verstanden wird: sicherer Crawler, ~60 deterministische Prüfungen, gewichtete Bewertung über 8 Kategorien, PDF-Bericht und optionale LLM-Erklärungen.",
      "منصة SaaS تقيّم مدى جاهزية موقع ويب لأن تفهمه وكلاء الذكاء الاصطناعي: زاحف آمن، نحو 60 فحصاً، تنقيط مرجّح على 8 فئات، تقرير PDF وشروحات LLM اختيارية.",
    ),
    tags: ["FastAPI", "Next.js", "TypeScript", "PostgreSQL", "Celery"],
    image: "/assets/images/project_ai_auditor_3d_light_1793556805441.jpg",
    github: "https://github.com/abdertalibi-gif/Agent_readiness_auditor",
    demo: "",
    published: true,
    featured: true,
    order: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-robot-simulator",
    title: loc(
      "Mobile Robot Simulator",
      "Simulation de robot mobile",
      "Simulation eines mobilen Roboters",
      "محاكاة روبوت متنقل",
    ),
    description: loc(
      "Differential-drive robot simulator: kinematic engine in TypeScript, real-time telemetry, autonomous obstacle avoidance and navigation scenarios (.obs/.pts) with JSON/CSV export.",
      "Simulateur de robot mobile différentiel : moteur cinématique en TypeScript, télémétrie temps réel, évitement d'obstacles autonome et scénarios de navigation (.obs/.pts), export JSON/CSV.",
      "Simulator für einen differentiellen mobilen Roboter: kinematische Engine in TypeScript, Echtzeit-Telemetrie, autonome Hindernisvermeidung und Navigationsszenarien (.obs/.pts) mit JSON/CSV-Export.",
      "محاكي روبوت متنقل تفاضلي: محرك حركي بلغة TypeScript، قياس عن بُعد فوري، تجنب تلقائي للعوائق وسيناريوهات تنقل (.obs/.pts) مع تصدير JSON/CSV.",
    ),
    tags: ["React", "TypeScript", "Vite", "Simulation"],
    image: "/assets/images/project_robot_vision_3d_light_1793556806282.jpg",
    github: "https://github.com/abdertalibi-gif/robotique",
    demo: "",
    published: true,
    featured: false,
    order: 3,
    createdAt: now,
    updatedAt: now,
  },
];

export const seedSkillCategories: SkillCategory[] = [
  {
    id: "cat-backend",
    key: "backend",
    name: loc(
      "Backend Development",
      "Développement Backend",
      "Backend-Entwicklung",
      "تطوير الواجهة الخلفية",
    ),
    order: 1,
  },
  {
    id: "cat-frontend",
    key: "frontend",
    name: loc(
      "Frontend & Mobile",
      "Frontend & Mobile",
      "Frontend & Mobile",
      "الواجهة الأمامية والجوال",
    ),
    order: 2,
  },
  {
    id: "cat-database",
    key: "database",
    name: loc(
      "Databases",
      "Bases de données",
      "Datenbanken",
      "قواعد البيانات",
    ),
    order: 3,
  },
  {
    id: "cat-ai",
    key: "ai",
    name: loc(
      "AI & Machine Learning",
      "IA & Machine Learning",
      "KI & Machine Learning",
      "الذكاء الاصطناعي والتعلم الآلي",
    ),
    order: 4,
  },
  {
    id: "cat-datascience",
    key: "datascience",
    name: loc("Data Science", "Science des Données", "Data Science", "علم البيانات"),
    order: 5,
  },
  {
    id: "cat-devops",
    key: "devops",
    name: loc(
      "DevOps & Tools",
      "DevOps & Outils",
      "DevOps & Werkzeuge",
      "DevOps والأدوات",
    ),
    order: 6,
  },
];

const skillSeed: Record<string, string[]> = {
  "cat-backend": ["Python", "Django", "Django REST Framework", "FastAPI", "REST APIs", "WebSockets"],
  "cat-frontend": ["React", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Flutter"],
  "cat-database": ["PostgreSQL", "MySQL", "SQL", "Redis"],
  "cat-ai": ["Machine Learning", "Deep Learning", "TensorFlow", "Keras", "OpenCV"],
  "cat-datascience": ["NumPy", "Pandas", "Scikit-learn", "Data Visualization"],
  "cat-devops": ["Docker", "Git", "GitHub", "Linux"],
};

export const seedSkills: Skill[] = Object.entries(skillSeed).flatMap(([categoryId, names]) =>
  names.map((name, index) => ({
    id: `skill-${categoryId.replace("cat-", "")}-${index + 1}`,
    categoryId,
    name: loc(name, name, name, name),
    order: index + 1,
  })),
);

export const seedEducation: EducationItem[] = [
  {
    id: "edu-master",
    degree: loc(
      "Master 1 — Data Science & Artificial Intelligence (SDIA)",
      "Master 1 — Sciences des Données et Intelligence Artificielle (SDIA)",
      "Master 1 — Data Science & Künstliche Intelligenz (SDIA)",
      "ماستر 1 — علوم البيانات والذكاء الاصطناعي (SDIA)",
    ),
    institution: loc(
      "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
      "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
      "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
      "جامعة مولاي إسماعيل — كلية العلوم، مكناس",
    ),
    description: loc(
      "Current cycle (expected completion 2028): machine learning, deep learning, big data engineering, software architecture and supervised projects.",
      "Cycle en cours (fin prévue en 2028) : apprentissage automatique, deep learning, ingénierie big data, architecture logicielle et projets encadrés.",
      "Laufender Zyklus (Abschluss voraussichtlich 2028): Machine Learning, Deep Learning, Big-Data-Engineering, Softwarearchitektur und betreute Projekte.",
      "مسار حالي (الإتمام المتوقع 2028): التعلم الآلي، التعلم العميق، هندسة البيانات الضخمة، هندسة البرمجيات ومشاريع مؤطرة.",
    ),
    period: "2026 – 2028 · En cours",
    order: 1,
  },
  {
    id: "edu-licence",
    degree: loc(
      "Licence d'Excellence — Data Science & Artificial Intelligence (SDIA)",
      "Licence d'Excellence — Sciences des Données et Intelligence Artificielle (SDIA)",
      "Licence d'Excellence — Data Science & Künstliche Intelligenz (SDIA)",
      "إجازة التميز — علوم البيانات والذكاء الاصطناعي (SDIA)",
    ),
    institution: loc(
      "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
      "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
      "Université Moulay Ismaïl — Faculté des Sciences, Meknès",
      "جامعة مولاي إسماعيل — كلية العلوم، مكناس",
    ),
    description: loc(
      "Selective honours degree: statistics, Python programming, databases, machine learning and a final-year project.",
      "Licence sélective orientée data science : statistiques, programmation Python, bases de données, apprentissage automatique et projet de fin d'études.",
      "Selektiver Studiengang: Statistik, Python-Programmierung, Datenbanken, Machine Learning und Abschlussprojekt.",
      "إجازة انتقائية: إحصاء، برمجة Python، قواعد بيانات، تعلم آلي ومشروع نهاية الدراسة.",
    ),
    period: "2026 · Obtenue",
    order: 2,
  },
  {
    id: "edu-deug",
    degree: loc(
      "DEUG — Applied Computer Science",
      "DEUG — Informatique Appliquée",
      "DEUG — Angewandte Informatik",
      "DEUG — المعلوميات التطبيقية",
    ),
    institution: loc(
      "Faculté des Sciences de Meknès — Université Moulay Ismaïl",
      "Faculté des Sciences de Meknès — Université Moulay Ismaïl",
      "Faculté des Sciences de Meknès — Université Moulay Ismaïl",
      "كلية العلوم بمكناس — جامعة مولاي إسماعيل",
    ),
    description: loc(
      "Computer science fundamentals: algorithms, data structures, programming, databases and networks.",
      "Fondamentaux de l'informatique : algorithmique, structures de données, programmation, bases de données et réseaux.",
      "Informatik-Grundlagen: Algorithmen, Datenstrukturen, Programmierung, Datenbanken und Netzwerke.",
      "أساسيات المعلوميات: الخوارزميات، هياكل البيانات، البرمجة، قواعد البيانات والشبكات.",
    ),
    period: "2025 · Obtenu",
    order: 3,
  },
  {
    id: "edu-bac",
    degree: loc("Baccalauréat", "Baccalauréat", "Abitur", "الباكالوريا"),
    institution: loc("Meknès, Maroc", "Meknès, Maroc", "Meknès, Marokko", "مكناس، المغرب"),
    description: loc("", "", "", ""),
    period: "2023",
    order: 4,
  },
];

export const seedExperiences: ExperienceItem[] = [
  {
    id: "exp-presenceqr",
    role: loc(
      "PrésenceQR — attendance management system",
      "PrésenceQR — système de gestion des présences",
      "PrésenceQR — Anwesenheitsverwaltung",
      "PrésenceQR — نظام إدارة الحضور",
    ),
    company: loc(
      "Final-year project · Faculté des Sciences de Meknès",
      "Projet de Fin d'Études · Faculté des Sciences de Meknès",
      "Abschlussprojekt · Faculté des Sciences de Meknès",
      "مشروع نهاية الدراسة · كلية العلوم بمكناس",
    ),
    location: loc("Meknès, Maroc", "Meknès, Maroc", "Meknès, Marokko", "مكناس، المغرب"),
    description: loc(
      "Designed and built the REST API (Django REST Framework), the real-time WebSocket layer and the PostgreSQL schema. Added proximity validation, Excel session reports and a Flutter client for students.",
      "Conception et développement de l'API REST (Django REST Framework), de la couche temps réel WebSockets et du schéma PostgreSQL. Ajout de la validation par proximité, des rapports de session Excel et d'un client Flutter pour les étudiants.",
      "Entwurf und Entwicklung der REST-API (Django REST Framework), der WebSocket-Echtzeitschicht und des PostgreSQL-Schemas. Näherungsvalidierung, Excel-Berichte und Flutter-Client für Studierende.",
      "تصميم وتطوير واجهة REST (Django REST Framework)، طبقة WebSockets الفورية ومخطط PostgreSQL، مع التحقق من القرب وتقارير Excel وتطبيق Flutter للطلبة.",
    ),
    period: "2026",
    employmentType: "Projet académique",
    order: 1,
  },
  {
    id: "exp-auditor",
    role: loc(
      "Agent Readiness Auditor — SaaS platform",
      "Agent Readiness Auditor — plateforme SaaS",
      "Agent Readiness Auditor — SaaS-Plattform",
      "Agent Readiness Auditor — منصة SaaS",
    ),
    company: loc(
      "Personal project · full-stack",
      "Projet personnel · full-stack",
      "Persönliches Projekt · Full-Stack",
      "مشروع شخصي · متكامل",
    ),
    location: loc("Meknès, Maroc", "Meknès, Maroc", "Meknès, Marokko", "مكناس، المغرب"),
    description: loc(
      "Built a FastAPI backend with a SSRF-safe crawler, ~60 deterministic analyzers, a weighted scoring engine, PDF reporting and an optional LLM explanation layer. Next.js dashboard, Celery worker, Docker Compose and database migrations with Alembic.",
      "Développement d'un backend FastAPI avec crawler sécurisé (SSRF), ~60 analyseurs déterministes, moteur de scoring pondéré, génération de rapports PDF et couche d'explications LLM optionnelle. Dashboard Next.js, worker Celery, Docker Compose et migrations Alembic.",
      "FastAPI-Backend mit SSRF-sicherem Crawler, ~60 deterministischen Analyzern, gewichteter Scoring-Engine, PDF-Berichten und optionaler LLM-Erklärungsschicht. Next.js-Dashboard, Celery-Worker, Docker Compose und Alembic-Migrationen.",
      "تطوير واجهة FastAPI مع زاحف آمن (SSRF)، نحو 60 محللاً، محرك تنقيط مرجّح، تقارير PDF وطبقة شروحات LLM اختيارية. لوحة Next.js، عامل Celery، Docker Compose وترحيلات Alembic.",
    ),
    period: "2026",
    employmentType: "Projet personnel",
    order: 2,
  },
  {
    id: "exp-robot",
    role: loc(
      "Mobile robot simulator",
      "Simulateur de robot mobile",
      "Simulator für mobile Roboter",
      "محاكي روبوت متنقل",
    ),
    company: loc(
      "Academic project · robotics",
      "Projet académique · robotique",
      "Akademisches Projekt · Robotik",
      "مشروع أكاديمي · الروبوتيك",
    ),
    location: loc("Meknès, Maroc", "Meknès, Maroc", "Meknès, Marokko", "مكناس، المغرب"),
    description: loc(
      "Implemented the kinematic engine (time step, wheel speeds, collisions) as a single source of truth, then a React dashboard for telemetry, trajectory replay and scenario loading.",
      "Implémentation du moteur cinématique (pas de temps, vitesses de roues, collisions) comme source de vérité unique, puis d'un tableau de bord React pour la télémétrie, le replay de trajectoire et le chargement de scénarios.",
      "Kinematik-Engine (Zeitschritt, Radgeschwindigkeiten, Kollisionen) als einzige Wahrheitsquelle, dazu ein React-Dashboard für Telemetrie, Trajektorien-Replay und Szenarien.",
      "تنفيذ المحرك الحركي (خطوة زمنية، سرعات العجلات، التصادمات) كمصدر وحيد للحقيقة، ثم لوحة React للقياس عن بُعد وإعادة عرض المسار وتحميل السيناريوهات.",
    ),
    period: "2026",
    employmentType: "Projet académique",
    order: 3,
  },
];

export const seedCertifications: Certification[] = [
  {
    id: "ach-licence",
    title: loc(
      "Licence d'Excellence in Data Science & AI",
      "Licence d'Excellence en Sciences des Données et IA",
      "Licence d'Excellence in Data Science & KI",
      "إجازة التميز في علوم البيانات والذكاء الاصطناعي",
    ),
    issuer: loc(
      "Université Moulay Ismaïl — Faculté des Sciences",
      "Université Moulay Ismaïl — Faculté des Sciences",
      "Université Moulay Ismaïl — Faculté des Sciences",
      "جامعة مولاي إسماعيل — كلية العلوم",
    ),
    date: "2026",
    expirationDate: "",
    credentialId: "",
    link: "",
    image: "",
    order: 1,
  },
  {
    id: "ach-pfe",
    title: loc(
      "PrésenceQR — final-year project",
      "PrésenceQR — Projet de Fin d'Études",
      "PrésenceQR — Abschlussprojekt",
      "PrésenceQR — مشروع نهاية الدراسة",
    ),
    issuer: loc(
      "Faculté des Sciences de Meknès",
      "Faculté des Sciences de Meknès",
      "Faculté des Sciences de Meknès",
      "كلية العلوم بمكناس",
    ),
    date: "2026",
    expirationDate: "",
    credentialId: "",
    link: "https://github.com/abdertalibi-gif/Qr_code_pfe-",
    image: "",
    order: 2,
  },
  {
    id: "ach-master",
    title: loc(
      "Admitted to the SDIA Master's programme",
      "Admission en Master SDIA",
      "Zulassung zum SDIA-Master",
      "القبول في ماستر SDIA",
    ),
    issuer: loc(
      "Université Moulay Ismaïl",
      "Université Moulay Ismaïl",
      "Université Moulay Ismaïl",
      "جامعة مولاي إسماعيل",
    ),
    date: "2026",
    expirationDate: "",
    credentialId: "",
    link: "",
    image: "",
    order: 3,
  },
];

export const seedAbout: AboutContent = {
  description: loc(
    "Master's student in Data Science and Artificial Intelligence (SDIA) at Université Moulay Ismaïl, holding a Licence d'Excellence in the same field. I build web applications and APIs with Python (Django, FastAPI), with a strong interest in backend engineering, intelligent systems and data. I learn by building: every academic or personal project is a chance to ship tested, documented and deployable code.",
    "Étudiant en Master Sciences des Données et Intelligence Artificielle (SDIA) à l'Université Moulay Ismaïl, titulaire d'une Licence d'Excellence dans la même filière. Je conçois des applications web et des API en Python (Django, FastAPI), avec un intérêt marqué pour l'ingénierie backend, les systèmes intelligents et les données. J'apprends en construisant : chaque projet académique ou personnel est l'occasion de livrer du code testé, documenté et déployable.",
    "Masterstudent in Data Science und Künstlicher Intelligenz (SDIA) an der Université Moulay Ismaïl, Inhaber einer Licence d'Excellence im selben Fach. Ich entwickle Webanwendungen und APIs mit Python (Django, FastAPI), mit starkem Interesse an Backend-Engineering, intelligenten Systemen und Daten.",
    "طالب في ماستر علوم البيانات والذكاء الاصطناعي (SDIA) بجامعة مولاي إسماعيل، حاصل على إجازة التميز في نفس التخصص. أبني تطبيقات ويب وواجهات برمجية بلغة Python (Django وFastAPI)، مع اهتمام خاص بهندسة الواجهة الخلفية والأنظمة الذكية والبيانات. أتعلم بالممارسة: كل مشروع أكاديمي أو شخصي فرصة لتسليم كود مُختبر وموثّق وقابل للنشر.",
  ),
  focus: [
    {
      id: "focus-1",
      text: loc(
        "SDIA Master's — 2026–2028",
        "Master SDIA — 2026–2028",
        "SDIA-Master — 2026–2028",
        "ماستر SDIA — 2026–2028",
      ),
    },
    {
      id: "focus-2",
      text: loc(
        "Python backend: Django & FastAPI",
        "Backend Python : Django & FastAPI",
        "Python-Backend: Django & FastAPI",
        "واجهة خلفية Python: Django وFastAPI",
      ),
    },
    {
      id: "focus-3",
      text: loc(
        "AI, data science & APIs",
        "IA, science des données & API",
        "KI, Data Science & APIs",
        "الذكاء الاصطناعي وعلم البيانات وواجهات API",
      ),
    },
    {
      id: "focus-4",
      text: loc(
        "Target: backend / AI engineering",
        "Objectif : ingénierie backend & IA",
        "Ziel: Backend- & KI-Engineering",
        "الهدف: هندسة الواجهة الخلفية والذكاء الاصطناعي",
      ),
    },
  ],
  professionalTitle: loc(
    "Software Engineer | AI & Backend Developer",
    "Software Engineer | AI & Backend Developer",
    "Softwareentwickler | KI & Backend",
    "مهندس برمجيات | ذكاء اصطناعي وواجهة خلفية",
  ),
  profileImage: "/assets/images/hero_portrait_developer_1793555044790.jpg",
};

export const seedContact: ContactContent = {
  email: EMAIL,
  phone: "",
  location: "Meknès, Maroc",
  github: GITHUB_URL,
  linkedin: LINKEDIN_URL,
  cvUrl: "/cv.pdf",
};

export const seedContent: PortfolioContent = {
  projects: seedProjects,
  skillCategories: seedSkillCategories,
  skills: seedSkills,
  education: seedEducation,
  experiences: seedExperiences,
  certifications: seedCertifications,
  about: seedAbout,
  contact: seedContact,
};
