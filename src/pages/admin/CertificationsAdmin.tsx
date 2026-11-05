import { useEffect, useState } from "react";
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
    setForm({ title: emptyLocalized(), issuer: emptyLocalized(), date: "", link: "", image: "" });
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
      setNotice(editing ? "Certification mise à jour." : "Certification ajoutée.");
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
    <div>
      <PageHeader
        eyebrow="Réalisations"
        title="Certifications"
        description="Ajoutez vos certificats, leurs images et les liens de vérification."
        actions={<Button icon={Plus} onClick={openCreate}>Nouvelle certification</Button>}
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {loading ? (
        <LoadingList rows={3} />
      ) : items.length === 0 ? (
        <Panel className="p-4">
          <EmptyState
            icon={Award}
            title="Aucune certification"
            description="Ajoutez un certificat pour mettre en avant vos compétences reconnues."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une certification</Button>}
          />
        </Panel>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Panel key={item.id} className="flex flex-col p-4">
              {item.image && (
                <div className="mb-3 h-32 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F28C28]/20 bg-[#F28C28]/10">
                  <Award className="h-5 w-5 text-[#F5A65B]" />
                </div>
                {item.date && <Badge tone="orange">{item.date}</Badge>}
              </div>
              <h3 className="mt-3 text-sm font-bold text-white">
                {item.title.en || item.title.fr || item.title.de || item.title.ar}
              </h3>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {item.issuer.en || item.issuer.fr || "—"}
              </p>

              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                {item.link && item.link !== "#" ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2196D3] hover:text-[#6FC3F0]"
                  >
                    Voir <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-600">Sans lien</span>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" className="px-2 py-1.5" icon={Pencil} onClick={() => openEdit(item)}>
                    <span className="sr-only">Modifier</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-2 py-1.5 text-red-300 hover:bg-red-500/10"
                    icon={Trash2}
                    onClick={() => setDeleting(item)}
                  >
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
        title={editing ? "Modifier la certification" : "Nouvelle certification"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" form="certification-form" loading={saving}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="certification-form" onSubmit={submit} className="space-y-5">
          {formError && <Alert type="error">{formError}</Alert>}
          <LocalizedField
            label="Titre du certificat"
            required
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
            placeholder="AWS Certified Cloud Practitioner"
          />
          <LocalizedField
            label="Organisme émetteur"
            value={form.issuer}
            onChange={(issuer) => setForm({ ...form, issuer })}
            placeholder="Amazon Web Services"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date" hint="Ex. : 2024">
              <TextInput
                value={form.date}
                placeholder="2024"
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </Field>
            <Field label="Lien du certificat" hint="URL de vérification ou PDF">
              <TextInput
                value={form.link}
                placeholder="https://…"
                onChange={(event) => setForm({ ...form, link: event.target.value })}
              />
            </Field>
          </div>
          <ImageUploader value={form.image} onChange={(image) => setForm({ ...form, image })} label="Image du certificat" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer cette certification ?"
        description={`« ${deleting?.title.en || deleting?.title.fr || ""} » sera retirée du portfolio.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
