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
  PhoneCall,
  Settings,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { ConfirmDialog, cn } from "./ui";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unread, setUnread] = useState(0);

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

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-[#0F7DB8] to-[#F28C28] p-0.5">
          <img
            src="/assets/aistudio/photoabder_3cbc0678.jpeg"
            alt="Abderrahim Talibi"
            className="h-full w-full rounded-[10px] object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black tracking-tight text-white">AT Admin</p>
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Portfolio console
          </p>
        </div>
      </div>

      <nav className="admin-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                active ? "bg-[#0F7DB8]/15 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-active-link"
                  className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-[#2196D3] to-[#0F7DB8]"
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-[#2196D3]" : "text-slate-500 group-hover:text-slate-300",
                )}
              />
              <span className="flex-1">{link.label}</span>
              {link.path === "/admin/messages" && unread > 0 && (
                <span className="rounded-full bg-[#F28C28] px-2 py-0.5 text-[10px] font-black text-black">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0F7DB8]/30 bg-[#0F7DB8]/10 text-xs font-black text-[#2196D3]">
            {user?.email?.slice(0, 2).toUpperCase() || "AT"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-200">{user?.email || "Administrateur"}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Session sécurisée</p>
          </div>
        </div>
        <button
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen lg:flex">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-white/10 bg-[#070E1B]/90 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#070E1B] lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050B16]/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Administration</p>
                <h2 className="text-sm font-bold text-white sm:text-base">
                  {titles[location.pathname] || "Administration"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-[#0F7DB8]/40 hover:text-white sm:flex"
              >
                Voir le portfolio
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10">
                <img
                  src="/assets/aistudio/photoabder_3cbc0678.jpeg"
                  alt="Administrateur"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

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
