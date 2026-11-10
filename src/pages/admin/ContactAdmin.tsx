import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Github, Linkedin, Mail, MapPin, Phone, Save, Send, FileText } from "lucide-react";
import type { ContactContent } from "../../../shared/types";
import { api } from "../../services/api";
import { useContent } from "../../context/ContentContext";
import { Alert, Button, Field, LoadingList, PageHeader, Panel, TextInput } from "../../components/admin/ui";

const emptyForm: ContactContent = {
  email: "",
  phone: "",
  location: "",
  github: "",
  linkedin: "",
  cvUrl: "",
};

export default function ContactAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [form, setForm] = useState<ContactContent>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api
      .getAdminContent()
      .then(({ content }) => {
        if (active) setForm({ ...content.contact });
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Impossible de charger le contact");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (field: keyof ContactContent, value: string) => setForm({ ...form, [field]: value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.updateContact(form);
      setNotice("Informations de contact mises à jour avec succès.");
      await refreshPublic();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement");
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
        eyebrow="Contenu"
        title="Coordonnées & Réseaux"
        description="Ces informations alimentent la section contact, le footer et les liens sociaux du portfolio."
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : (
        <form onSubmit={submit} className="grid gap-5 lg:grid-cols-3">
          {/* Main Form Fields */}
          <Panel className="p-4 sm:p-5 lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-white mb-2">
              Coordonnées directes
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email public" required hint="Utilisé pour les boutons de contact direct">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    type="email"
                    required
                    className="pl-9"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="contact@talibi.me"
                  />
                </div>
              </Field>

              <Field label="Numéro de téléphone" hint="Facultatif">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    className="pl-9"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>
              </Field>

              <Field label="Localisation" hint="Ville, Pays">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    className="pl-9"
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="Meknès, Maroc"
                  />
                </div>
              </Field>

              <Field label="Lien du CV (PDF)" hint="Chemin ou URL du CV">
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    className="pl-9"
                    value={form.cvUrl}
                    onChange={(event) => update("cvUrl", event.target.value)}
                    placeholder="/assets/cv.pdf"
                  />
                </div>
              </Field>

              <Field label="Profil GitHub">
                <div className="relative">
                  <Github className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    className="pl-9"
                    value={form.github}
                    onChange={(event) => update("github", event.target.value)}
                    placeholder="https://github.com/votre-nom"
                  />
                </div>
              </Field>

              <Field label="Profil LinkedIn">
                <div className="relative">
                  <Linkedin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    className="pl-9"
                    value={form.linkedin}
                    onChange={(event) => update("linkedin", event.target.value)}
                    placeholder="https://linkedin.com/in/votre-nom"
                  />
                </div>
              </Field>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button type="submit" icon={Save} loading={saving}>
                Enregistrer les coordonnées
              </Button>
            </div>
          </Panel>

          {/* Quick Preview Card */}
          <div className="space-y-4">
            <Panel className="p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-bold text-white mb-1">
                Aperçu en direct
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Rendu visuel sur le portfolio public.
              </p>

              <div className="space-y-2.5">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                    <p className="text-xs font-semibold text-white truncate">{form.email || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Téléphone</p>
                    <p className="text-xs font-semibold text-white truncate">{form.phone || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Localisation</p>
                    <p className="text-xs font-semibold text-white truncate">{form.location || "Non renseignée"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <Send className="h-3.5 w-3.5" />
                  <span>Formulaire de contact</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  Les messages envoyés par les visiteurs sur le portfolio arrivent instantanément dans l'onglet Messages.
                </p>
              </div>
            </Panel>
          </div>
        </form>
      )}
    </motion.div>
  );
}
