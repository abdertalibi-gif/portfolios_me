import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  Code2,
  Inbox,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { AdminStats } from "../../../shared/types";
import { api } from "../../services/api";
import {
  Alert,
  Badge,
  Button,
  LoadingList,
  PageHeader,
  Panel,
  Skeleton,
  cn,
} from "../../components/admin/ui";

const statConfig = [
  { key: "projects", label: "Projets", path: "/admin/projects", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "skills", label: "Compétences", path: "/admin/skills", icon: Code2, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { key: "certifications", label: "Certifications", path: "/admin/certifications", icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "experiences", label: "Expériences", path: "/admin/experiences", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "messages", label: "Messages", path: "/admin/messages", icon: Inbox, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
] as const;

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await api.getStats());
    } catch {
      setError("Impossible de charger les statistiques du tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 60000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Tableau de bord"
        description="Suivez l'activité de votre portfolio et accédez rapidement à chaque section."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={() => void load()} loading={loading}>
            Actualiser
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statConfig.map((stat, index) => {
          const Icon = stat.icon;
          const value = stats ? (stats[stat.key] as number) : null;

          return (
            <Link
              key={stat.key}
              to={stat.path}
              className="group rounded-xl border border-white/10 bg-[#0D1730]/75 p-4 sm:p-5 hover:border-blue-500/40 hover:bg-[#121E3A] transition-all duration-150 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", stat.bg, stat.color)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                  {value !== null ? value : <Skeleton className="h-8 w-14" />}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-slate-400 group-hover:text-slate-300">
                  {stat.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Dual Panels: Recent Messages & Recent Projects */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Messages Panel */}
        <Panel className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Derniers messages
              </h2>
              <p className="text-xs text-slate-400">
                Demandes reçues via le formulaire de contact.
              </p>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-semibold text-blue-400 hover:text-cyan-300 transition"
            >
              Tout voir →
            </Link>
          </div>

          {loading && !stats ? (
            <LoadingList rows={3} />
          ) : stats && stats.recentMessages.length > 0 ? (
            <div className="space-y-2.5">
              {stats.recentMessages.slice(0, 5).map((message) => (
                <div
                  key={message.id}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 transition-colors"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-cyan-400 border border-blue-500/20">
                    {message.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs sm:text-sm font-semibold text-white">
                        {message.subject}
                      </p>
                      {!message.read && <Badge tone="amber">Nouveau</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {message.name} · {message.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-10 text-center text-slate-400">
              <Inbox className="mb-2 h-6 w-6 text-slate-500" />
              <p className="text-xs font-semibold text-slate-300">Aucun message pour le moment</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Les demandes des visiteurs apparaîtront ici.
              </p>
            </div>
          )}
        </Panel>

        {/* Projects Panel */}
        <Panel className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Projets récents
              </h2>
              <p className="text-xs text-slate-400">
                Statut et aperçu de vos réalisations.
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="text-xs font-semibold text-blue-400 hover:text-cyan-300 transition"
            >
              Gérer →
            </Link>
          </div>

          {loading && !stats ? (
            <LoadingList rows={3} />
          ) : stats && stats.recentProjects.length > 0 ? (
            <div className="space-y-2.5">
              {stats.recentProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-2.5 hover:border-white/20 transition-colors"
                >
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-[#081127]">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs sm:text-sm font-semibold text-white">
                      {project.title.fr || project.title.en}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {project.tags.join(" · ") || "Aucun tag"}
                    </p>
                  </div>
                  <Badge tone={project.published ? "green" : "slate"}>
                    {project.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-10 text-center text-slate-400">
              <Briefcase className="mb-2 h-6 w-6 text-slate-500" />
              <p className="text-xs font-semibold text-slate-300">Aucun projet enregistré</p>
            </div>
          )}
        </Panel>
      </div>
    </motion.div>
  );
}
