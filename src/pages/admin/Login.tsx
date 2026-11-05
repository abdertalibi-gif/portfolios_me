import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Alert, Button } from "../../components/admin/ui";
import "../../admin.css";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from || "/admin/dashboard";

  useEffect(() => {
    document.title = "Admin — Abderrahim Talibi";
  }, []);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Identifiants incorrects");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
      <div className="pointer-events-none absolute inset-0 admin-grid-lines opacity-60" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#0F7DB8]/15 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[460px] w-[460px] rounded-full bg-[#F28C28]/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#08101D]/90 shadow-2xl backdrop-blur-xl lg:grid-cols-2"
      >
        <div className="hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-[#0B1B2E] via-[#08111F] to-[#050B16] p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-[#0F7DB8] to-[#F28C28] p-0.5">
              <img
                src="/assets/aistudio/photoabder_3cbc0678.jpeg"
                alt="Abderrahim Talibi"
                className="h-full w-full rounded-[10px] object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-white">Abderrahim Talibi</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                Software Engineer & AI
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#2196D3]">
              Espace privé
            </p>
            <h1 className="text-3xl font-black leading-tight text-white">
              Pilotez votre portfolio,
              <br />
              <span className="text-[#2196D3]">sans toucher au code.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Gérez projets, compétences, formations et messages. Chaque modification est publiée
              instantanément sur les quatre langues du portfolio.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Sessions chiffrées · Accès protégé côté serveur
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-[#0F7DB8] to-[#F28C28] p-0.5">
              <img
                src="/assets/aistudio/photoabder_3cbc0678.jpeg"
                alt="Abderrahim Talibi"
                className="h-full w-full rounded-[10px] object-cover"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0F7DB8]/25 bg-[#0F7DB8]/10 px-3 py-1.5">
              <Lock className="h-3 w-3 text-[#2196D3]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7CC8EF]">
                Accès administrateur
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">Connexion sécurisée</h2>
            <p className="mt-2 text-sm text-slate-400">Identifiez-vous pour accéder au dashboard.</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="admin-label" htmlFor="admin-email">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@talibi.me"
                  className="admin-input pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="admin-label" htmlFor="admin-password">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="admin-input pl-10 pr-11"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-200"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={submitting} className="w-full py-3">
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-xs font-semibold text-slate-500 transition hover:text-[#2196D3]"
            >
              ← Retour au portfolio
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              v1.0 · Admin
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
