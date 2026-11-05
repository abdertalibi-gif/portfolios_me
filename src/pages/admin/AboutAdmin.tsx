import { useEffect, useState } from "react";
import { Plus, Save, Sparkles, Trash2, User } from "lucide-react";
import type { FocusItem, LocalizedText } from "../../../shared/types";
import { emptyLocalized } from "../../../shared/types";
import { api, type AboutInput } from "../../services/api";
import { useContent } from "../../context/ContentContext";
import {
  Alert,
  Button,
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
  const [form, setForm] = useState<AboutInput>({ description: emptyLocalized(), focus: [] });
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
      await api.updateAbout({ description: form.description, focus: cleaned });
      setNotice("Présentation mise à jour sur le portfolio.");
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
        title="À propos"
        description="Modifiez votre présentation personnelle et les points forts affichés sur le portfolio, dans les quatre langues."
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Panel className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0F7DB8]/20 bg-[#0F7DB8]/10">
                <User className="h-5 w-5 text-[#2196D3]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Présentation personnelle</h2>
                <p className="text-xs text-slate-500">Le paragraphe principal de la section « À propos ».</p>
              </div>
            </div>
            <LocalizedField
              label="Présentation"
              required
              multiline
              rows={6}
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
              placeholder="Je suis un ingénieur logiciel spécialisé en…"
            />
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F28C28]/20 bg-[#F28C28]/10">
                  <Sparkles className="h-5 w-5 text-[#F5A65B]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Points de focus</h2>
                  <p className="text-xs text-slate-500">Affichés dans la colonne de droite de la section.</p>
                </div>
              </div>
              <Button type="button" variant="secondary" icon={Plus} onClick={() => setForm({ ...form, focus: [...form.focus, createFocus()] })}>
                Ajouter un point
              </Button>
            </div>

            <div className="space-y-4">
              {form.focus.map((item, index) => (
                <div key={item.id} className="admin-panel p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Point {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, focus: form.focus.filter((entry) => entry.id !== item.id) })
                      }
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                      aria-label="Supprimer le point"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <LocalizedField
                    label="Texte"
                    value={item.text}
                    onChange={(text) => updateFocus(item.id, text)}
                    placeholder="Parcours Académique"
                  />
                </div>
              ))}
              {form.focus.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
                  Aucun point de focus. Ajoutez-en au moins un.
                </p>
              )}
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button type="submit" icon={Save} loading={saving}>Enregistrer les modifications</Button>
          </div>
        </form>
      )}
    </div>
  );
}
