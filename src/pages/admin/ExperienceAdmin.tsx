import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Briefcase, Pencil, Plus, Trash2, MapPin } from "lucide-react";
import type { ExperienceItem } from "../../../shared/types";
import { emptyLocalized } from "../../../shared/types";
import { api, type ExperienceInput } from "../../services/api";
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

const emptyForm: ExperienceInput = {
  role: emptyLocalized(),
  company: emptyLocalized(),
  location: emptyLocalized(),
  description: emptyLocalized(),
  period: "",
  employmentType: "",
};

export default function ExperienceAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [form, setForm] = useState<ExperienceInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<ExperienceItem | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { content } = await api.getAdminContent();
      setItems(content.experiences);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les expériences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ role: emptyLocalized(), company: emptyLocalized(), location: emptyLocalized(), description: emptyLocalized(), period: "", employmentType: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item: ExperienceItem) => {
    setEditing(item);
    setForm({
      role: { ...emptyLocalized(), ...item.role },
      company: { ...emptyLocalized(), ...item.company },
      location: { ...emptyLocalized(), ...(item.location ?? {}) },
      description: { ...emptyLocalized(), ...(item.description ?? {}) },
      period: item.period,
      employmentType: item.employmentType,
    });
    setFormError("");
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!Object.values(form.role).some((value) => value.trim())) {
      setFormError("Ajoutez un intitulé de poste dans au moins une langue.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.updateExperience(editing.id, form);
      else await api.createExperience(form);
      setModalOpen(false);
      setNotice(editing ? "Expérience mise à jour." : "Expérience ajoutée avec succès.");
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
      await api.deleteExperience(deleting.id);
      setDeleting(null);
      setNotice("Expérience supprimée.");
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
        title="Gestion des expériences"
        description="Ajoutez et organisez vos expériences professionnelles et missions avec détails traduits."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouvelle expérience
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
            icon={Briefcase}
            title="Aucune expérience enregistrée"
            description="Ajoutez une expérience professionnelle pour enrichir votre parcours sur le portfolio."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une expérience</Button>}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Panel key={item.id} className="p-4 sm:p-5 hover:border-white/20 transition-all duration-150">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {item.role?.fr || item.role?.en || item.role?.de || item.role?.ar}
                      </h3>
                      {item.period && <Badge tone="orange">{item.period}</Badge>}
                      {item.employmentType && <Badge tone="slate">{item.employmentType}</Badge>}
                    </div>
                    <p className="text-xs font-semibold text-purple-300">
                      {item.company?.fr || item.company?.en || "—"}
                    </p>
                    {(item.location?.fr || item.location?.en) && (
                      <p className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {item.location?.fr || item.location?.en}
                      </p>
                    )}
                    {(item.description?.fr || item.description?.en) && (
                      <p className="text-xs text-slate-400 leading-normal line-clamp-2 pt-1">
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
        title={editing ? "Modifier l'expérience" : "Nouvelle expérience"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" form="experience-form" loading={saving}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="experience-form" onSubmit={submit} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <LocalizedField
              label="Poste occupé"
              required
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
              placeholder="Software Engineer & AI Developer"
            />
            <LocalizedField
              label="Entreprise / organisation"
              value={form.company}
              onChange={(company) => setForm({ ...form, company })}
              placeholder="Freelance / Tech Company"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Période" hint="Ex. : 2023 – Présent">
              <TextInput
                value={form.period}
                placeholder="2023 – Présent"
                onChange={(event) => setForm({ ...form, period: event.target.value })}
              />
            </Field>
            <Field label="Type d'emploi">
              <select
                value={form.employmentType}
                onChange={(event) => setForm({ ...form, employmentType: event.target.value })}
                className="w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 px-3 text-sm text-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un type</option>
                <option value="CDI">CDI (Plein temps)</option>
                <option value="Freelance">Freelance / Indépendant</option>
                <option value="Stage">Stage</option>
                <option value="CDD">CDD</option>
              </select>
            </Field>
          </div>
          <LocalizedField
            label="Localisation"
            value={form.location}
            onChange={(location) => setForm({ ...form, location })}
            placeholder="Meknès, Maroc (Hybride)"
          />
          <LocalizedField
            label="Missions & réalisations"
            multiline
            rows={3}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="Description des projets, responsabilités et impact..."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer cette expérience ?"
        description={`« ${deleting?.role?.fr || deleting?.role?.en || ""} » sera retirée du portfolio.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
