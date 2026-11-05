import { useState } from "react";
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
      setError("Saisissez votre mot de passe actuel pour confirmer.");
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
      setNotice("Identifiants mis à jour. Les autres sessions ont été fermées.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sécurité"
        title="Paramètres du compte"
        description="Modifiez l'adresse administrateur ou le mot de passe. Les identifiants ne sont jamais exposés au navigateur."
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <div className="grid gap-5 lg:grid-cols-3">
        <form onSubmit={submit} className="admin-card p-5 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0F7DB8]/20 bg-[#0F7DB8]/10">
              <KeyRound className="h-5 w-5 text-[#2196D3]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Identifiants</h2>
              <p className="text-xs text-slate-500">Connexion : {user?.email || "—"}</p>
            </div>
          </div>

          <div className="space-y-5">
            <Field label="Adresse email" required>
              <TextInput
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </Field>

            <div className="border-t border-white/10 pt-5">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Changement de mot de passe (facultatif)
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
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

            <Field label="Mot de passe actuel" required hint="Requis pour valider toute modification">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <TextInput
                  type="password"
                  required
                  className="pl-10"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                />
              </div>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" icon={Save} loading={saving}>Enregistrer</Button>
          </div>
        </form>

        <div className="space-y-4">
          <Panel className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Sécurité active
            </div>
            <ul className="space-y-2 text-[11px] leading-relaxed text-slate-400">
              <li>• Sessions httpOnly, SameSite strict</li>
              <li>• Vérification de l'origine sur les écritures</li>
              <li>• Limitation des tentatives de connexion</li>
              <li>• Validation serveur de toutes les données</li>
              <li>• Uploads limités à 5 Mo, formats vérifiés</li>
            </ul>
          </Panel>

          <Panel className="p-5">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Données</p>
            <p className="text-xs leading-relaxed text-slate-400">
              Le contenu est stocké dans <span className="font-mono text-slate-300">data/db.json</span> sur le
              serveur. Une sauvegarde de ce fichier suffit à préserver l'ensemble du portfolio.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Dernière mise à jour :{" "}
              <span className="font-semibold text-slate-300">
                {user ? new Date(user.updatedAt).toLocaleString("fr-FR") : "—"}
              </span>
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
