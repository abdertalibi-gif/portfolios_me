import { useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
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
  description: emptyLocalized(),
  period: "",
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
    setForm({ role: emptyLocalized(), company: emptyLocalized(), description: emptyLocalized(), period: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item: ExperienceItem) => {
    setEditing(item);
    setForm({
      role: { ...item.role },
      company: { ...item.company },
      description: { ...item.description },
      period: item.period,
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
      setNotice(editing ? "Expérience mise à jour." : "Expérience ajoutée.");
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
    <div>
      <PageHeader
        eyebrow="Parcours"
        title="Expériences"
        description="Ajoutez vos expériences professionnelles et leurs descriptions localisées."
        actions={<Button icon={Plus} onClick={openCreate}>Nouvelle expérience</Button>}
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : items.length === 0 ? (
        <Panel className="p-4">
          <EmptyState
            icon={Briefcase}
            title="Aucune expérience"
            description="Ajoutez une expérience professionnelle pour valoriser votre parcours."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une expérience</Button>}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Panel key={item.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#F28C28]/20 bg-[#F28C28]/10">
                  <Briefcase className="h-6 w-6 text-[#F5A65B]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {item.role.fr || item.role.en || item.role.de || item.role.ar}
                    </h3>
                    {item.period && <Badge tone="orange">{item.period}</Badge>}
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#F5A65B]">
                    {item.company.fr || item.company.en || "—"}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                    {item.description.fr || item.description.en}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="secondary" className="px-3 py-2" icon={Pencil} onClick={() => openEdit(item)}>
                    <span className="hidden md:inline">Modifier</span>
                  </Button>
                  <Button variant="danger" className="px-3 py-2" icon={Trash2} onClick={() => setDeleting(item)}>
                    <span className="sr-only">Supprimer</span>
                  </Button>
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
        <form id="experience-form" onSubmit={submit} className="space-y-5">
          {formError && <Alert type="error">{formError}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <LocalizedField
              label="Poste occupé"
              required
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
              placeholder="Software Engineer & AI Developer"
            />
            <LocalizedField
              label="Entreprise / contexte"
              value={form.company}
              onChange={(company) => setForm({ ...form, company })}
              placeholder="Freelance / Projets"
            />
          </div>
          <LocalizedField
            label="Description"
            multiline
            rows={4}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="Missions, technologies, résultats…"
          />
          <Field label="Période" hint="Ex. : 2023 – Présent">
            <TextInput
              value={form.period}
              placeholder="2023 – Present"
              onChange={(event) => setForm({ ...form, period: event.target.value })}
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer cette expérience ?"
        description={`« ${deleting?.role.fr || deleting?.role.en || ""} » sera retirée du portfolio.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
