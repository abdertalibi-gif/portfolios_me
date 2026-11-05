import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, FolderKanban, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
      setNotice(editing ? "Projet mis à jour et publié sur le portfolio." : "Projet créé avec succès.");
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
    <div>
      <PageHeader
        eyebrow="Contenu"
        title="Projets"
        description="Créez, modifiez, publiez ou masquez vos projets. Les modifications apparaissent immédiatement sur le portfolio."
        actions={<Button icon={Plus} onClick={openCreate}>Nouveau projet</Button>}
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <Panel className="mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un projet ou un tag…"
            className="admin-input pl-10"
          />
        </div>
      </Panel>

      {loading ? (
        <LoadingList rows={4} />
      ) : filtered.length === 0 ? (
        <Panel className="p-4">
          <EmptyState
            icon={FolderKanban}
            title={items.length === 0 ? "Aucun projet" : "Aucun résultat"}
            description={
              items.length === 0
                ? "Ajoutez votre premier projet pour enrichir votre portfolio."
                : "Essayez un autre mot-clé."
            }
            action={items.length === 0 ? <Button icon={Plus} onClick={openCreate}>Créer un projet</Button> : undefined}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Panel key={project.id} className="p-3 sm:p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-20 sm:w-32">
                  {project.image ? (
                    <img src={project.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FolderKanban className="h-6 w-6 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-white">
                      {project.title.en || project.title.fr || project.title.de || project.title.ar}
                    </h3>
                    <Badge tone={project.published ? "green" : "amber"}>
                      {project.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {project.description.fr || project.description.en}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} tone="blue">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    className="px-3 py-2"
                    icon={project.published ? EyeOff : Eye}
                    onClick={() => void togglePublished(project)}
                    loading={busyId === project.id}
                    title={project.published ? "Masquer" : "Publier"}
                  >
                    <span className="hidden md:inline">{project.published ? "Masquer" : "Publier"}</span>
                  </Button>
                  <Button variant="secondary" className="px-3 py-2" icon={Pencil} onClick={() => openEdit(project)}>
                    <span className="hidden md:inline">Modifier</span>
                  </Button>
                  <Button variant="danger" className="px-3 py-2" icon={Trash2} onClick={() => setDeleting(project)}>
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
        title={editing ? "Modifier le projet" : "Nouveau projet"}
        description="Les champs vides utilisent automatiquement la traduction anglaise en secours."
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button type="submit" form="project-form" loading={saving}>
              {editing ? "Enregistrer" : "Créer le projet"}
            </Button>
          </>
        }
      >
        <form id="project-form" onSubmit={submit} className="space-y-5">
          {formError && <Alert type="error">{formError}</Alert>}

          <LocalizedField
            label="Titre"
            required
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
            placeholder="PrésenceQR"
          />

          <LocalizedField
            label="Description"
            required
            multiline
            rows={4}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="Décrivez le projet, les technologies et les résultats…"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TagsInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
            <Field label="Statut">
              <div className="flex h-[42px] items-center rounded-xl border border-white/10 bg-white/[0.02] px-4">
                <Toggle
                  checked={form.published}
                  onChange={(published) => setForm({ ...form, published })}
                  label={form.published ? "Visible sur le portfolio" : "Brouillon privé"}
                />
              </div>
            </Field>
          </div>

          <ImageUploader value={form.image} onChange={(image) => setForm({ ...form, image })} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lien GitHub">
              <TextInput
                value={form.github}
                placeholder="https://github.com/…"
                onChange={(event) => setForm({ ...form, github: event.target.value })}
              />
            </Field>
            <Field label="Lien démo">
              <TextInput
                value={form.demo}
                placeholder="https://…"
                onChange={(event) => setForm({ ...form, demo: event.target.value })}
              />
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer ce projet ?"
        description={`« ${deleting?.title.en || deleting?.title.fr || "" } » sera définitivement supprimé du portfolio. Cette action est irréversible.`}
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
