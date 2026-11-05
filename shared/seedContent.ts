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

const loc = (en: string, fr: string, de: string, ar: string) => ({ en, fr, de, ar });
const now = new Date().toISOString();

export const seedProjects: Project[] = [
  {
    id: "proj-presenceqr",
    title: loc("PrésenceQR", "PrésenceQR", "PrésenceQR", "PrésenceQR"),
    description: loc(
      "Smart Attendance Management System using QR codes, Django, WebSockets, and PostgreSQL for real-time tracking.",
      "Système intelligent de gestion des présences utilisant des codes QR, Django, WebSockets et PostgreSQL pour un suivi en temps réel.",
      "Intelligentes Anwesenheitsmanagementsystem mit QR-Codes, Django, WebSockets und PostgreSQL für Echtzeit-Tracking.",
      "نظام ذكي لإدارة الحضور باستخدام رموز QR و Django و WebSockets و PostgreSQL للتتبع في الوقت الفعلي.",
    ),
    tags: ["Django", "WebSockets", "PostgreSQL"],
    image: "/assets/images/project_attendance_3d_light_1793556805155.jpg",
    github: "#",
    demo: "#",
    published: true,
    order: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-agent-auditor",
    title: loc("Agent Readiness Auditor", "Agent Readiness Auditor", "Agent Readiness Auditor", "Agent Readiness Auditor"),
    description: loc(
      "Intelligent platform for evaluating AI agent readiness and compliance with industry standards.",
      "Plateforme intelligente pour évaluer l'état de préparation et la conformité des agents IA par rapport aux normes de l'industrie.",
      "Intelligente Plattform zur Bewertung der KI-Agenten-Bereitschaft und Einhaltung von Industriestandards.",
      "منصة ذكية لتقييم جاهزية وكلاء الذكاء الاصطناعي والامتثال لمعايير الصناعة.",
    ),
    tags: ["Python", "AI", "Compliance"],
    image: "/assets/images/project_ai_auditor_3d_light_1793556805441.jpg",
    github: "#",
    demo: "#",
    published: true,
    order: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-robotvision",
    title: loc("RobotVision AI", "RobotVision AI", "RobotVision AI", "RobotVision AI"),
    description: loc(
      "Computer vision system for object detection and robotic arm guidance using TensorFlow and OpenCV.",
      "Système de vision par ordinateur pour la détection d'objets et le guidage de bras robotiques utilisant TensorFlow et OpenCV.",
      "Computer-Vision-System zur Objekterkennung und Roboterarmführung mit TensorFlow und OpenCV.",
      "نظام رؤية حاسوبية للكشف عن الأشياء وتوجيه الذراع الروبوتية باستخدام TensorFlow و OpenCV.",
    ),
    tags: ["TensorFlow", "Keras", "OpenCV"],
    image: "/assets/images/project_robot_vision_3d_light_1793556806282.jpg",
    github: "#",
    demo: "#",
    published: true,
    order: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-facebook-assistant",
    title: loc(
      "Facebook Share Assistant",
      "Facebook Share Assistant",
      "Facebook Share Assistant",
      "Facebook Share Assistant",
    ),
    description: loc(
      "Automation tool for managing and optimizing Facebook sharing workflows for content creators.",
      "Outil d'automatisation pour gérer et optimiser les flux de partage Facebook pour les créateurs de contenu.",
      "Automatisierungstool zum Verwalten und Optimieren von Facebook-Sharing-Workflows für Content-Ersteller.",
      "أداة أتمتة لإدارة وتحسين سير عمل مشاركة فيسبوك لمنشئي المحتوى.",
    ),
    tags: ["Python", "Automation", "API"],
    image: "/assets/images/project_facebook_3d_light_1793556806358.jpg",
    github: "#",
    demo: "#",
    published: true,
    order: 4,
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
      "Frontend Development",
      "Développement Frontend",
      "Frontend-Entwicklung",
      "تطوير الواجهة الأمامية",
    ),
    order: 2,
  },
  {
    id: "cat-database",
    key: "database",
    name: loc(
      "Database Management",
      "Gestion de Bases de Données",
      "Datenbankmanagement",
      "إدارة قواعد البيانات",
    ),
    order: 3,
  },
  {
    id: "cat-devops",
    key: "devops",
    name: loc("DevOps & Cloud", "DevOps & Cloud", "DevOps & Cloud", "DevOps والسحابة"),
    order: 4,
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
    order: 5,
  },
  {
    id: "cat-datascience",
    key: "datascience",
    name: loc("Data Science", "Science des Données", "Data Science", "علم البيانات"),
    order: 6,
  },
];

const skillSeed: Record<string, string[]> = {
  "cat-backend": ["Python", "Django", "FastAPI", "REST APIs", "Flask"],
  "cat-frontend": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML/CSS"],
  "cat-database": ["PostgreSQL", "SQL", "Redis", "MongoDB"],
  "cat-devops": ["Docker", "Git", "GitHub", "Cloud Deployment", "Nginx"],
  "cat-ai": ["Machine Learning", "Deep Learning", "TensorFlow", "Keras", "OpenCV"],
  "cat-datascience": ["Pandas", "NumPy", "Matplotlib", "Scikit-Learn", "Data Visualization"],
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
    id: "edu-1",
    degree: loc(
      "Licence d'Excellence en Sciences des Données et Intelligence Artificielle (SDIA)",
      "Licence d'Excellence en Sciences des Données et Intelligence Artificielle (SDIA)",
      "Licence d'Excellence en Sciences des Données et Intelligence Artificielle (SDIA)",
      "Licence d'Excellence en Sciences des Données et Intelligence Artificielle (SDIA)",
    ),
    institution: loc(
      "Université Moulay Ismail — Faculté des Sciences, Meknès",
      "Université Moulay Ismail — Faculté des Sciences, Meknès",
      "Université Moulay Ismail — Faculté des Sciences, Meknès",
      "Université Moulay Ismail — Faculté des Sciences, Meknès",
    ),
    period: "2023 – 2026",
    order: 1,
  },
];

export const seedExperiences: ExperienceItem[] = [
  {
    id: "exp-1",
    role: loc(
      "Software Engineer & AI Developer",
      "Ingénieur Logiciel & Développeur IA",
      "Softwareentwickler & KI-Entwickler",
      "مهندس برمجيات ومطور ذكاء اصطناعي",
    ),
    company: loc("Freelance / Projects", "Freelance / Projets", "Freelance / Projekte", "عمل حر / مشاريع"),
    description: loc(
      "Developing intelligent backend solutions and AI-powered applications for various clients and research projects.",
      "Développement de solutions backend intelligentes et d'applications alimentées par l'IA pour divers clients et projets de recherche.",
      "Entwicklung intelligenter Backend-Lösungen und KI-gestützter Anwendungen für verschiedene Kunden und Forschungsprojekte.",
      "تطوير حلول خلفية ذكية وتطبيقات مدعومة بالذكاء الاصطناعي لمختلف العملاء ومشاريع البحث.",
    ),
    period: "2023 – Present",
    order: 1,
  },
];

export const seedCertifications: Certification[] = [
  {
    id: "cert-aws",
    title: loc(
      "AWS Certified Cloud Practitioner",
      "AWS Certified Cloud Practitioner",
      "AWS Certified Cloud Practitioner",
      "AWS Certified Cloud Practitioner",
    ),
    issuer: loc("Amazon Web Services", "Amazon Web Services", "Amazon Web Services", "Amazon Web Services"),
    date: "2024",
    link: "#",
    image: "",
    order: 1,
  },
  {
    id: "cert-tensorflow",
    title: loc(
      "TensorFlow Developer Certificate",
      "TensorFlow Developer Certificate",
      "TensorFlow Developer Certificate",
      "TensorFlow Developer Certificate",
    ),
    issuer: loc("DeepLearning.AI / Google", "DeepLearning.AI / Google", "DeepLearning.AI / Google", "DeepLearning.AI / Google"),
    date: "2023",
    link: "#",
    image: "",
    order: 2,
  },
  {
    id: "cert-python-ds",
    title: loc(
      "Python for Data Science and Machine Learning",
      "Python for Data Science and Machine Learning",
      "Python for Data Science and Machine Learning",
      "Python for Data Science and Machine Learning",
    ),
    issuer: loc("Udemy / Jose Portilla", "Udemy / Jose Portilla", "Udemy / Jose Portilla", "Udemy / Jose Portilla"),
    date: "2023",
    link: "#",
    image: "",
    order: 3,
  },
];

export const seedAbout: AboutContent = {
  description: loc(
    "I am a Software Engineer specializing in Data Science and Artificial Intelligence from Université Moulay Ismail. My passion lies in building scalable systems and intelligent applications that solve complex real-world problems. I combine academic excellence with technical expertise to deliver high-impact engineering solutions.",
    "Je suis un ingénieur logiciel spécialisé en Science des Données et Intelligence Artificielle de l'Université Moulay Ismail. Ma passion réside dans la construction de systèmes évolutifs et d'applications intelligentes qui résolvent des problèmes complexes du monde réel. Je combine l'excellence académique avec l'expertise technique pour fournir des solutions d'ingénierie à fort impact.",
    "Ich bin Softwareentwickler mit Spezialisierung auf Data Science und Künstliche Intelligenz von der Université Moulay Ismail. Meine Leidenschaft liegt in der Entwicklung skalierbarer Systeme und intelligenter Anwendungen. Ich verbinde akademische Exzellenz mit technischem Fachwissen.",
    "أنا مهندس برمجيات متخصص في علوم البيانات والذكاء الاصطناعي من جامعة مولاي إسماعيل. شغفي يكمن في بناء أنظمة قابلة للتطوير وتطبيقات ذكية تحل مشاكل العالم الحقيقي المعقدة. أجمع بين التميز الأكاديمي والخبرة التقنية لتقديم حلول هندسية عالية التأثير.",
  ),
  focus: [
    {
      id: "focus-1",
      text: loc("Academic Path", "Parcours Académique", "Akademischer Weg", "المسار الأكاديمي"),
    },
    {
      id: "focus-2",
      text: loc("Data Science & AI", "Science des Données & IA", "Data Science & KI", "علم البيانات والذكاء الاصطناعي"),
    },
    {
      id: "focus-3",
      text: loc("Professional Goals", "Objectifs Professionnels", "Berufliche Ziele", "الأهداف المهنية"),
    },
    {
      id: "focus-4",
      text: loc("Key Strengths", "Points Forts", "Kernkompetenzen", "نقاط القوة"),
    },
  ],
};

export const seedContact: ContactContent = {
  email: "as.kouskous@edu.umi.ac.ma",
  phone: "",
  location: "Meknès, Maroc",
  github: "https://github.com/atalibi",
  linkedin: "https://linkedin.com/in/abderrahim-talibi",
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
