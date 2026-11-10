import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import type { Certification } from "../../../shared/types";
import { emptyLocalized } from "../../../shared/types";
import { api, type CertificationInput } from "../../services/api";
import { useContent } from "../../context/ContentContext";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  ImageUploader,
  LoadingList,
  LocalizedField,
  Modal,
  PageHeader,
  Panel,
  TextInput,
} from "../../components/admin/ui";

const emptyForm: CertificationInput = {
  title: emptyLocalized(),
  issuer: emptyLocalized(),
  date: "",
  link: "",
  image: "",
  expirationDate: "",
  credentialId: "",
};

export default function CertificationsAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [form, setForm] = useState<CertificationInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<Certification | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { content } = await api.getAdminContent();
      setItems(content.certifications);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les certifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, title: emptyLocalized(), issuer: emptyLocalized() });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item: Certification) => {
    setEditing(item);
    setForm({
      title: { ...item.title },
      issuer: { ...item.issuer },
      date: item.date,
      link: item.link,
      image: item.image,
      expirationDate: item.expirationDate,
      credentialId: item.credentialId,
    });
    setFormError("");
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!Object.values(form.title).some((value) => value.trim())) {
      setFormError("Ajoutez un titre dans au moins une langue.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.updateCertification(editing.id, form);
      else await api.createCertification(form);
      setModalOpen(false);
      setNotice(editing ? "Certification mise à jour." : "Certification ajoutée avec succès.");
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
      await api.deleteCertification(deleting.id);
      setDeleting(null);
      setNotice("Certification supprimée.");
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
        eyebrow="Réalisations"
        title="Gestion des certifications"
        description="Ajoutez et organisez vos certificats, diplômes professionnels et accréditations."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouvelle certification
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
            icon={Award}
            title="Aucune certification enregistrée"
            description="Ajoutez vos certificats pour prouver vos compétences certifiées sur le portfolio."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une certification</Button>}
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Panel
              key={item.id}
              className="p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-150"
            >
              <div>
                {/* Header row with badges and actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="green">
                      <Award className="h-3 w-3 mr-0.5 inline" />
                      Certifié
                    </Badge>
                    {item.date && <Badge tone="blue">{item.date}</Badge>}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded p-1 text-slate-400 hover:text-blue-300 hover:bg-white/10 transition cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(item)}
                      className="rounded p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Certificate image preview if exists */}
                {item.image && (
                  <div className="h-28 w-full rounded-lg overflow-hidden border border-white/10 bg-[#081127] mb-3">
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-sm sm:text-base font-bold text-white">
                  {item.title.fr || item.title.en || item.title.de || item.title.ar}
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                  {item.issuer.fr || item.issuer.en || "—"}
                </p>
                {item.credentialId && (
                  <p className="mt-1 text-[11px] font-mono text-slate-400">
                    ID : {item.credentialId}
                  </p>
                )}
              </div>

              {item.link && item.link !== "#" && (
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-cyan-300 transition"
                  >
                    <span>Vérifier le certificat</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la certification" : "Nouvelle certification"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" form="cert-form" loading={saving}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="cert-form" onSubmit={submit} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}

          <LocalizedField
            label="Intitulé de la certification"
            required
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
            placeholder="IBM Data Science Professional Certificate…"
          />

          <LocalizedField
            label="Organisme émetteur"
            value={form.issuer}
            onChange={(issuer) => setForm({ ...form, issuer })}
            placeholder="IBM / Coursera"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date d'obtention" hint="Ex. : Août 2024">
              <TextInput
                value={form.date}
                placeholder="Août 2024"
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </Field>
            <Field label="Identifiant (Credential ID)">
              <TextInput
                value={form.credentialId || ""}
                placeholder="ex : 7X9K2L4M"
                onChange={(event) => setForm({ ...form, credentialId: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Lien de vérification" hint="Lien officiel vers le certificat (Coursera, Credly, etc.)">
            <TextInput
              value={form.link}
              placeholder="https://www.coursera.org/verify/…"
              onChange={(event) => setForm({ ...form, link: event.target.value })}
            />
          </Field>

          <ImageUploader
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            label="Image du certificat"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer cette certification ?"
        description={`« ${deleting?.title.fr || deleting?.title.en || ""} » sera retirée du portfolio.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
