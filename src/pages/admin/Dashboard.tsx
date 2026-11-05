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
import { Alert, Badge, Button, LoadingList, PageHeader, Panel, Skeleton } from "../../components/admin/ui";

const statConfig = [
  { key: "projects", label: "Projets", icon: Briefcase, accent: "text-[#6FC3F0]", bg: "bg-[#0F7DB8]/10", to: "/admin/projects" },
  { key: "skills", label: "Compétences", icon: Code2, accent: "text-[#F5A65B]", bg: "bg-[#F28C28]/10", to: "/admin/skills" },
  { key: "certifications", label: "Certifications", icon: Award, accent: "text-emerald-300", bg: "bg-emerald-500/10", to: "/admin/certifications" },
  { key: "experiences", label: "Expériences", icon: Building2, accent: "text-violet-300", bg: "bg-violet-500/10", to: "/admin/experiences" },
  { key: "messages", label: "Messages", icon: Inbox, accent: "text-rose-300", bg: "bg-rose-500/10", to: "/admin/messages" },
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
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les statistiques");
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
    <div>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Bienvenue, Abderrahim"
        description="Suivez l'activité de votre portfolio et accédez rapidement à chaque section."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={() => void load()} loading={loading}>
            Actualiser
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {statConfig.map((stat, index) => {
          const Icon = stat.icon;
          const value = stats ? (stats[stat.key] as number) : null;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={stat.to} className="admin-card group block h-full p-4 transition hover:border-[#0F7DB8]/40 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.accent}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-[#2196D3]" />
                </div>
                {value === null ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  <p className="text-3xl font-black tabular-nums text-white">
                    {value}
                    {stat.key === "messages" && stats && stats.unreadMessages > 0 && (
                      <span className="ml-2 align-middle text-[10px] font-black uppercase tracking-wider text-[#F28C28]">
                        {stats.unreadMessages} non lu{stats.unreadMessages > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                )}
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Derniers messages</h2>
              <p className="mt-1 text-xs text-slate-500">Les demandes reçues via le formulaire public.</p>
            </div>
            <Link to="/admin/messages" className="text-xs font-bold text-[#2196D3] hover:text-[#6FC3F0]">
              Tout voir
            </Link>
          </div>

          {loading && !stats ? (
            <LoadingList rows={4} />
          ) : stats && stats.recentMessages.length > 0 ? (
            <div className="space-y-2">
              {stats.recentMessages.map((message) => (
                <Link
                  key={message.id}
                  to="/admin/messages"
                  className="flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F7DB8]/10 text-xs font-black text-[#6FC3F0]">
                    {message.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-200">{message.subject}</p>
                      {!message.read && <Badge tone="orange">Nouveau</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {message.name} · {message.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-600">
                    {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center">
              <Inbox className="mb-3 h-7 w-7 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Aucun message pour le moment</p>
              <p className="mt-1 text-xs text-slate-600">Les messages du formulaire de contact apparaîtront ici.</p>
            </div>
          )}
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Projets récents</h2>
              <p className="mt-1 text-xs text-slate-500">Statut de publication de vos projets.</p>
            </div>
            <Link to="/admin/projects" className="text-xs font-bold text-[#2196D3] hover:text-[#6FC3F0]">
              Gérer
            </Link>
          </div>

          {loading && !stats ? (
            <LoadingList rows={4} />
          ) : (
            <div className="space-y-2">
              {stats?.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {project.image ? (
                      <img src={project.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Sparkles className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-200">{project.title.en || project.title.fr}</p>
                    <p className="truncate text-xs text-slate-500">{project.tags.join(" · ") || "Sans tags"}</p>
                  </div>
                  <Badge tone={project.published ? "green" : "slate"}>
                    {project.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-[#0F7DB8]/20 bg-[#0F7DB8]/5 p-4">
            <p className="text-xs font-bold text-slate-300">
              {stats ? `${stats.publishedProjects} projet(s) publié(s) sur ${stats.projects}` : "Chargement…"}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0F7DB8] to-[#2196D3] transition-all duration-700"
                style={{
                  width: stats && stats.projects > 0 ? `${(stats.publishedProjects / stats.projects) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Les brouillons restent visibles uniquement dans l'administration.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
