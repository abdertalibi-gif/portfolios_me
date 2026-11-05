import { useEffect, useState } from "react";
import { Github, Linkedin, Mail, MapPin, Phone, Save, Send } from "lucide-react";
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
      setNotice("Informations de contact mises à jour sur le portfolio.");
      await refreshPublic();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Contenu"
        title="Contact"
        description="Ces informations alimentent la section contact, le footer et les liens sociaux du hero."
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : (
        <form onSubmit={submit} className="grid gap-5 lg:grid-cols-3">
          <Panel className="p-5 sm:p-6 lg:col-span-2">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email public" required hint="Utilisé par le bouton « Email me »">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <TextInput
                    type="email"
                    required
                    className="pl-10"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="contact@exemple.com"
                  />
                </div>
              </Field>

              <Field label="Téléphone" hint="Facultatif">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <TextInput
                    className="pl-10"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>
              </Field>

              <Field label="Localisation">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <TextInput
                    className="pl-10"
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="Meknès, Maroc"
                  />
                </div>
              </Field>

              <Field label="Lien CV" hint="PDF accessible publiquement">
                <TextInput
                  value={form.cvUrl}
                  onChange={(event) => update("cvUrl", event.target.value)}
                  placeholder="/cv.pdf"
                />
              </Field>

              <Field label="GitHub">
                <div className="relative">
                  <Github className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <TextInput
                    className="pl-10"
                    value={form.github}
                    onChange={(event) => update("github", event.target.value)}
                    placeholder="https://github.com/…"
                  />
                </div>
              </Field>

              <Field label="LinkedIn">
                <div className="relative">
                  <Linkedin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <TextInput
                    className="pl-10"
                    value={form.linkedin}
                    onChange={(event) => update("linkedin", event.target.value)}
                    placeholder="https://linkedin.com/in/…"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" icon={Save} loading={saving}>Enregistrer</Button>
            </div>
          </Panel>

          <Panel className="h-fit p-5 sm:p-6">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Aperçu rapide</p>
            <div className="space-y-3">
              <div className="admin-panel flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F7DB8]/10">
                  <Mail className="h-4 w-4 text-[#2196D3]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Email</p>
                  <p className="truncate text-xs font-semibold text-slate-200">{form.email || "—"}</p>
                </div>
              </div>
              <div className="admin-panel flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Phone className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Téléphone</p>
                  <p className="truncate text-xs font-semibold text-slate-200">{form.phone || "—"}</p>
                </div>
              </div>
              <div className="admin-panel flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F28C28]/10">
                  <MapPin className="h-4 w-4 text-[#F5A65B]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Localisation</p>
                  <p className="truncate text-xs font-semibold text-slate-200">{form.location || "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#0F7DB8]/20 bg-[#0F7DB8]/5 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7CC8EF]">
                <Send className="h-3.5 w-3.5" />
                Formulaire public
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                Les messages envoyés depuis le portfolio arrivent directement dans la section Messages.
              </p>
            </div>
          </Panel>
        </form>
      )}
    </div>
  );
}
