import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import type { EducationItem } from "../../../shared/types";
import { emptyLocalized } from "../../../shared/types";
import { api, type EducationInput } from "../../services/api";
import { useContent } from "../../context/ContentContext";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingList,
  LocalizedField,
  Modal,
  PageHeader,
  Panel,
  TextInput,
} from "../../components/admin/ui";

const emptyForm: EducationInput = {
  degree: emptyLocalized(),
  institution: emptyLocalized(),
  description: emptyLocalized(),
  period: "",
};

export default function EducationAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [items, setItems] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EducationItem | null>(null);
  const [form, setForm] = useState<EducationInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<EducationItem | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { content } = await api.getAdminContent();
      setItems(content.education);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger la formation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, degree: emptyLocalized(), institution: emptyLocalized(), description: emptyLocalized(), period: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item: EducationItem) => {
    setEditing(item);
    setForm({
      degree: { ...emptyLocalized(), ...item.degree },
      institution: { ...emptyLocalized(), ...item.institution },
      description: { ...emptyLocalized(), ...(item.description ?? {}) },
      period: item.period,
    });
    setFormError("");
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!Object.values(form.degree).some((value) => value.trim())) {
      setFormError("Ajoutez un diplôme dans au moins une langue.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.updateEducation(editing.id, form);
      else await api.createEducation(form);
      setModalOpen(false);
      setNotice(editing ? "Formation mise à jour." : "Formation ajoutée avec succès.");
      await load();
      await refreshPublic();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.deleteEducation(deleting.id);
      setDeleting(null);
      setNotice("Formation supprimée.");
      await load();
      await refreshPublic();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Échec de la suppression");
    } finally {
      setDeletingBusy(false);
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
        eyebrow="Parcours"
        title="Formation"
        description="Gérez vos diplômes et certifications académiques traduits dans les quatre langues."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouvelle formation
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : items.length === 0 ? (
        <Panel>
          <EmptyState
            icon={GraduationCap}
            title="Aucune formation enregistrée"
            description="Ajoutez un diplôme ou une formation pour compléter votre parcours."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une formation</Button>}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Panel key={item.id} className="p-4 sm:p-5 hover:border-white/20 transition-all duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-cyan-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {item.degree?.fr || item.degree?.en || item.degree?.de || item.degree?.ar}
                      </h3>
                      {item.period && <Badge tone="blue">{item.period}</Badge>}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {item.institution?.fr || item.institution?.en || "—"}
                    </p>
                    {(item.description?.fr || item.description?.en) && (
                      <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                        {item.description?.fr || item.description?.en}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg p-2 text-slate-400 hover:text-blue-300 hover:bg-white/10 transition cursor-pointer"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la formation" : "Nouvelle formation"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" form="education-form" loading={saving}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="education-form" onSubmit={submit} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}

          <LocalizedField
            label="Diplôme / formation"
            required
            value={form.degree}
            onChange={(degree) => setForm({ ...form, degree })}
            placeholder="Licence d'Excellence en Sciences des Données…"
          />

          <LocalizedField
            label="Établissement"
            value={form.institution}
            onChange={(institution) => setForm({ ...form, institution })}
            placeholder="Université Moulay Ismail — Faculté des Sciences"
          />

          <Field label="Période" hint="Ex. : 2023 – 2026">
            <TextInput
              value={form.period}
              placeholder="2023 – 2026"
              onChange={(event) => setForm({ ...form, period: event.target.value })}
            />
          </Field>

          <LocalizedField
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="Description des acquis, mentions ou projets clés..."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer cette formation ?"
        description={`« ${deleting?.degree?.fr || deleting?.degree?.en || ""} » sera retirée du portfolio.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
