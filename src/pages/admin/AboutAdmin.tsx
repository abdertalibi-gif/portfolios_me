import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Save, Sparkles, Trash2, User } from "lucide-react";
import type { FocusItem, LocalizedText } from "../../../shared/types";
import { emptyLocalized } from "../../../shared/types";
import { api, type AboutInput } from "../../services/api";
import { useContent } from "../../context/ContentContext";
import {
  Alert,
  Button,
  ImageUploader,
  LoadingList,
  LocalizedField,
  PageHeader,
  Panel,
} from "../../components/admin/ui";

function createFocus(): FocusItem {
  return { id: `focus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: emptyLocalized() };
}

export default function AboutAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [form, setForm] = useState<AboutInput>({
    description: emptyLocalized(),
    focus: [],
    professionalTitle: emptyLocalized(),
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api
      .getAdminContent()
      .then(({ content }) => {
        if (!active) return;
        setForm({
          description: { ...content.about.description },
          focus: content.about.focus.map((item) => ({ id: item.id, text: { ...item.text } })),
          professionalTitle: content.about.professionalTitle || emptyLocalized(),
          profileImage: content.about.profileImage || "",
        });
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Impossible de charger la présentation");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateFocus = (id: string, text: LocalizedText) => {
    setForm((current) => ({
      ...current,
      focus: current.focus.map((item) => (item.id === id ? { ...item, text } : item)),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const cleaned = form.focus.filter((item) => Object.values(item.text).some((value) => value.trim()));
    if (!Object.values(form.description).some((value) => value.trim())) {
      setError("Ajoutez une présentation dans au moins une langue.");
      return;
    }
    if (cleaned.length === 0) {
      setError("Ajoutez au moins un point de focus.");
      return;
    }
    setSaving(true);
    try {
      await api.updateAbout({
        description: form.description,
        focus: cleaned,
        professionalTitle: form.professionalTitle,
        profileImage: form.profileImage,
      });
      setNotice("Présentation mise à jour avec succès sur le portfolio.");
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
        title="Présentation personnelle"
        description="Modifiez votre texte de présentation et les points clés affichés sur la section « À propos »."
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {/* Section 1: Biographie / Description */}
          <Panel className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white">
                Biographie principale
              </h2>
              <p className="text-xs text-slate-400">
                Texte principal présentant votre parcours et vos expertises.
              </p>
            </div>

            <LocalizedField
              label="Texte de présentation"
              required
              multiline
              rows={5}
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
              placeholder="Ingénieur logiciel spécialisé en développement full-stack et IA..."
            />
          </Panel>

          {/* Section 2: Points de focus */}
          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Points forts & Domaines d'intérêt
                </h2>
                <p className="text-xs text-slate-400">
                  Affichés comme des éléments clés dans la section.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setForm({ ...form, focus: [...form.focus, createFocus()] })}
              >
                Ajouter un point
              </Button>
            </div>

            <div className="space-y-3">
              {form.focus.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      Point {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, focus: form.focus.filter((entry) => entry.id !== item.id) })
                      }
                      className="rounded p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      aria-label="Supprimer le point"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <LocalizedField
                    label="Contenu du point"
                    value={item.text}
                    onChange={(text) => updateFocus(item.id, text)}
                    placeholder="Expertise en Vision par Ordinateur & Modèles LLM..."
                  />
                </div>
              ))}
              {form.focus.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/10 py-6 text-center text-xs text-slate-400">
                  Aucun point de focus. Cliquez sur « Ajouter un point » ci-dessus.
                </div>
              )}
            </div>
          </Panel>

          {/* Section 3: Titre professionnel et photo */}
          <Panel className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white">
                Informations complémentaires
              </h2>
              <p className="text-xs text-slate-400">
                Titre d'en-tête et photo de profil.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LocalizedField
                label="Titre professionnel"
                value={form.professionalTitle || emptyLocalized()}
                onChange={(professionalTitle) => setForm({ ...form, professionalTitle })}
                placeholder="Software Engineer & AI Developer"
              />

              <ImageUploader
                value={form.profileImage || ""}
                onChange={(profileImage) => setForm({ ...form, profileImage })}
                label="Photo de profil"
              />
            </div>
          </Panel>

          <div className="flex justify-end pt-2">
            <Button type="submit" icon={Save} loading={saving}>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
