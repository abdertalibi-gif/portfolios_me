import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, FolderKanban, Pencil, Plus, Search, Trash2, ExternalLink, Github } from "lucide-react";
import type { Project } from "../../../shared/types";
import { api, type ProjectInput } from "../../services/api";
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
  TagsInput,
  TextInput,
  Toggle,
  cn,
} from "../../components/admin/ui";
import { emptyLocalized } from "../../../shared/types";

const emptyForm: ProjectInput = {
  title: emptyLocalized(),
  description: emptyLocalized(),
  tags: [],
  image: "",
  github: "",
  demo: "",
  published: true,
  featured: false,
};

export default function ProjectsAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { content } = await api.getAdminContent();
      setItems(content.projects);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les projets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (project) =>
        [project.title.en, project.title.fr, project.title.de, project.title.ar]
          .join(" ")
          .toLowerCase()
          .includes(query) || project.tags.join(" ").toLowerCase().includes(query),
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, title: emptyLocalized(), description: emptyLocalized(), tags: [] });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      title: { ...project.title },
      description: { ...project.description },
      tags: [...project.tags],
      image: project.image,
      github: project.github,
      demo: project.demo,
      published: project.published,
      featured: project.featured,
    });
    setFormError("");
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    const hasTitle = Object.values(form.title).some((value) => value.trim());
    const hasDescription = Object.values(form.description).some((value) => value.trim());
    if (!hasTitle) {
      setFormError("Ajoutez un titre dans au moins une langue.");
      return;
    }
    if (!hasDescription) {
      setFormError("Ajoutez une description dans au moins une langue.");
      return;
    }

    setSaving(true);
    try {
      if (editing) await api.updateProject(editing.id, form);
      else await api.createProject(form);
      setModalOpen(false);
      setNotice(editing ? "Projet mis à jour." : "Projet créé avec succès.");
      await load();
      await refreshPublic();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (project: Project) => {
    setBusyId(project.id);
    setError("");
    try {
      const { item } = await api.publishProject(project.id, !project.published);
      setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
      setNotice(item.published ? "Projet publié." : "Projet déplacé en brouillon.");
      await refreshPublic();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Échec de la mise à jour");
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api.deleteProject(deleting.id);
      setDeleting(null);
      setNotice("Projet supprimé.");
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
        eyebrow="Contenu"
        title="Gestion des projets"
        description="Créez, modifiez, publiez ou masquez vos réalisations. Les modifications sont synchronisées en direct."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouveau projet
          </Button>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par titre ou tag..."
            className="h-[38px] w-full rounded-lg bg-[#081127] border border-white/10 pl-9 pr-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 shrink-0">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={FolderKanban}
            title={items.length === 0 ? "Aucun projet" : "Aucun résultat trouvé"}
            description={
              items.length === 0
                ? "Ajoutez votre premier projet pour mettre en avant vos réalisations."
                : "Aucun projet ne correspond à votre recherche."
            }
            action={items.length === 0 ? <Button icon={Plus} onClick={openCreate}>Créer un projet</Button> : undefined}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Panel
              key={project.id}
              className="p-4 sm:p-5 hover:border-white/20 transition-all duration-150"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                {/* Image Preview */}
                <div className="h-24 w-full sm:w-36 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#081127]">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      <FolderKanban className="h-6 w-6 opacity-50" />
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {project.title.fr || project.title.en}
                    </h3>
                    <Badge tone={project.published ? "green" : "slate"}>
                      {project.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>

                  <p className="line-clamp-2 text-xs text-slate-400 leading-normal">
                    {project.description.fr || project.description.en}
                  </p>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="Voir la démo"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="Voir le code GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => togglePublished(project)}
                    disabled={busyId === project.id}
                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title={project.published ? "Passer en brouillon" : "Publier"}
                  >
                    {project.published ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    className="rounded-lg p-2 text-slate-400 hover:text-blue-300 hover:bg-white/10 transition cursor-pointer"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(project)}
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

      {/* Modal Edit / Create */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le projet" : "Nouveau projet"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="project-form" loading={saving}>
              {editing ? "Enregistrer" : "Créer le projet"}
            </Button>
          </>
        }
      >
        <form id="project-form" onSubmit={submit} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}

          <LocalizedField
            label="Titre du projet"
            required
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
            placeholder="Système IA d'audit financier"
          />

          <LocalizedField
            label="Description"
            required
            multiline
            rows={3}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="Description détaillée du projet et des technologies utilisées..."
          />

          <TagsInput
            value={form.tags}
            onChange={(tags) => setForm({ ...form, tags })}
            label="Technologies / Tags"
            hint="Séparez par des virgules (ex: React, Python, OpenCV)"
          />

          <ImageUploader
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            label="Image de couverture"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lien GitHub">
              <TextInput
                value={form.github}
                placeholder="https://github.com/..."
                onChange={(event) => setForm({ ...form, github: event.target.value })}
              />
            </Field>
            <Field label="Lien démo en direct">
              <TextInput
                value={form.demo}
                placeholder="https://..."
                onChange={(event) => setForm({ ...form, demo: event.target.value })}
              />
            </Field>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <Toggle
              checked={form.published}
              onChange={(published) => setForm({ ...form, published })}
              label="Publier immédiatement sur le portfolio"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer ce projet ?"
        description={`« ${deleting?.title.fr || deleting?.title.en || ""} » sera définitivement supprimé.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
