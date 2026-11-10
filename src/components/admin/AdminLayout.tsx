import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PhoneCall,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { ConfirmDialog, cn } from "./ui";
import { useTranslation } from "react-i18next";
import "../../admin.css";

const links = [
  { path: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { path: "/admin/projects", label: "Projets", icon: Briefcase },
  { path: "/admin/skills", label: "Compétences", icon: Code2 },
  { path: "/admin/education", label: "Formation", icon: GraduationCap },
  { path: "/admin/experiences", label: "Expériences", icon: Briefcase },
  { path: "/admin/certifications", label: "Certifications", icon: Award },
  { path: "/admin/about", label: "À propos", icon: User },
  { path: "/admin/contact", label: "Contact", icon: PhoneCall },
  { path: "/admin/messages", label: "Messages", icon: Inbox },
  { path: "/admin/settings", label: "Paramètres", icon: Settings },
];

const titles: Record<string, string> = {
  "/admin/dashboard": "Tableau de bord",
  "/admin/projects": "Gestion des projets",
  "/admin/skills": "Gestion des compétences",
  "/admin/education": "Gestion de la formation",
  "/admin/experiences": "Gestion des expériences",
  "/admin/certifications": "Gestion des certifications",
  "/admin/about": "Présentation personnelle",
  "/admin/contact": "Informations de contact",
  "/admin/messages": "Messages reçus",
  "/admin/settings": "Paramètres du compte",
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unread, setUnread] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    api
      .getStats()
      .then((stats) => {
        if (active) setUnread(stats.unreadMessages);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
      navigate("/admin/login", { replace: true });
    }
  };

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const storedTheme = localStorage.getItem("admin-theme") as "dark" | "light" | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="sidebar-brand-text">AT Admin</span>
          <p className="sidebar-brand-subtitle">Console Portfolio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav admin-scroll">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn("sidebar-nav-item", active && "active")}
              aria-label={link.label}
            >
              <Icon
                className={cn(
                  "sidebar-nav-icon",
                  active ? "text-cyan-400" : "text-slate-400",
                )}
              />
              <span className="flex-1 truncate">{link.label}</span>
              {link.path === "/admin/messages" && unread > 0 && (
                <span className="sidebar-nav-badge">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar">
            {user?.email?.slice(0, 2).toUpperCase() || "AT"}
          </div>
          <div className="sidebar-profile-info">
            <p className="sidebar-profile-name">
              {user?.email || "Administrateur"}
            </p>
            <p className="sidebar-profile-status">Session active</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="sidebar-logout"
          aria-label="Déconnexion"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-shell" data-theme={theme}>
      {/* Desktop In-Flow Sticky Sidebar */}
      <aside className="admin-sidebar">
        {sidebarContent}
      </aside>

      {/* Main Content Area - margin-left prevents sidebar overlap on desktop */}
      <div className="admin-main ml-sidebar-desktop">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="header-mobile-menu lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="header-brand">
              <span className="header-breadcrumb">Administration</span>
              <h2 className="header-title">
                {titles[location.pathname] || "Administration"}
              </h2>
            </div>
          </div>

          <div className="header-right">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="header-portfolio-link"
              title="Voir le portfolio dans un nouvel onglet"
            >
              <span className="hidden sm:inline">Voir le portfolio</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>

            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="header-language-select"
              aria-label="Langue"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="de">DE</option>
              <option value="ar">AR</option>
            </select>

            <button
              type="button"
              onClick={toggleTheme}
              className="header-icon-btn"
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              aria-label="Basculer le thème"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-300" />}
            </button>

            <div className="header-avatar" title={user?.email || "Administrateur"}>
              {user?.email?.slice(0, 2).toUpperCase() || "AT"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-white/10 bg-[#081127] shadow-2xl lg:hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3.5 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white z-10 cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        description="Votre session administrateur sera fermée. Vous devrez vous reconnecter pour accéder au dashboard."
        confirmLabel="Se déconnecter"
        loading={loggingOut}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => void handleLogout()}
      />
    </div>
  );
}
