import { useState } from "react";
import { motion } from "motion/react";
import { KeyRound, Lock, Save, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Alert, Button, Field, PageHeader, Panel, TextInput } from "../../components/admin/ui";

export default function SettingsAdmin() {
  const { user, refresh } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!currentPassword) {
      setError("Saisissez votre mot de passe actuel pour confirmer les modifications.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!newPassword && email.trim().toLowerCase() === (user?.email || "").toLowerCase()) {
      setError("Aucune modification à enregistrer.");
      return;
    }

    setSaving(true);
    try {
      await api.updateAccount({
        currentPassword,
        email: email.trim(),
        newPassword: newPassword || undefined,
      });
      await refresh();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Identifiants mis à jour avec succès.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <PageHeader
        eyebrow="Sécurité"
        title="Paramètres du compte"
        description="Gérez les accès administrateur, votre adresse email de connexion et votre mot de passe."
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <Panel className="p-4 sm:p-5">
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Compte Administrateur
                  </h2>
                  <p className="text-xs text-slate-400">
                    Connecté en tant que : <span className="text-slate-200 font-medium">{user?.email || "—"}</span>
                  </p>
                </div>
              </div>

              <Field label="Adresse email" required>
                <TextInput
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  placeholder="admin@talibi.me"
                />
              </Field>

              <div className="pt-3 border-t border-white/5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Changement de mot de passe (optionnel)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nouveau mot de passe" hint="8 caractères minimum">
                    <TextInput
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                    />
                  </Field>
                  <Field label="Confirmer le mot de passe">
                    <TextInput
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <Field
                  label="Mot de passe actuel"
                  required
                  hint="Requis pour valider et appliquer les modifications"
                >
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <TextInput
                      type="password"
                      required
                      className="pl-9"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                    />
                  </div>
                </Field>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/5">
                <Button type="submit" icon={Save} loading={saving}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        {/* Security Info Sidebar */}
        <div className="space-y-4">
          <Panel className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Sécurité active</span>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Sessions chiffrées httpOnly & SameSite strict
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Hachage sécurisé des mots de passe
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Protection contre les attaques par force brute
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Uploads média sécurisés et formats vérifiés
              </li>
            </ul>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Stockage des données
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              Le contenu est stocké de manière persistante dans <span className="font-mono text-cyan-400">data/db.json</span>.
            </p>
            <p className="mt-3 text-[11px] text-slate-500">
              Dernière synchronisation :{" "}
              <span className="font-medium text-slate-300">
                {user ? new Date(user.updatedAt).toLocaleString("fr-FR") : "—"}
              </span>
            </p>
          </Panel>
        </div>
      </div>
    </motion.div>
  );
}
