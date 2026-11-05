import { useEffect, useMemo, useState } from "react";
import { Code2, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Skill, SkillCategory } from "../../../shared/types";
import { emptyLocalized } from "../../../shared/types";
import { api, type SkillCategoryInput, type SkillInput } from "../../services/api";
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
  cn,
} from "../../components/admin/ui";

type DeleteTarget = { type: "category" | "skill"; id: string; label: string } | null;

export default function SkillsAdmin() {
  const { refresh: refreshPublic } = useContent();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"skills" | "categories">("skills");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<SkillCategoryInput>({ key: "", name: emptyLocalized() });
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [skillModal, setSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillForm, setSkillForm] = useState<SkillInput>({ categoryId: "", name: emptyLocalized() });
  const [savingSkill, setSavingSkill] = useState(false);
  const [skillError, setSkillError] = useState("");

  const [deleting, setDeleting] = useState<DeleteTarget>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { content } = await api.getAdminContent();
      setCategories(content.skillCategories);
      setSkills(content.skills);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossible de charger les compétences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories
      .filter((category) => filterCategory === "all" || category.id === filterCategory)
      .map((category) => ({
        category,
        skills: skills
          .filter((skill) => skill.categoryId === category.id)
          .filter((skill) => !query || Object.values(skill.name).join(" ").toLowerCase().includes(query))
          .sort((a, b) => a.order - b.order),
      }))
      .filter((group) => !query || group.skills.length > 0 || group.category.name.en.toLowerCase().includes(query));
  }, [categories, skills, search, filterCategory]);

  const openCategoryCreate = () => {
    setEditingCategory(null);
    setCategoryForm({ key: "", name: emptyLocalized() });
    setCategoryError("");
    setCategoryModal(true);
  };

  const openCategoryEdit = (category: SkillCategory) => {
    setEditingCategory(category);
    setCategoryForm({ key: category.key, name: { ...category.name } });
    setCategoryError("");
    setCategoryModal(true);
  };

  const submitCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setCategoryError("");
    if (!Object.values(categoryForm.name).some((value) => value.trim())) {
      setCategoryError("Ajoutez un nom dans au moins une langue.");
      return;
    }
    setSavingCategory(true);
    try {
      if (editingCategory) await api.updateCategory(editingCategory.id, categoryForm);
      else await api.createCategory(categoryForm);
      setCategoryModal(false);
      setNotice(editingCategory ? "Catégorie mise à jour." : "Catégorie créée.");
      await load();
      await refreshPublic();
    } catch (saveError) {
      setCategoryError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement");
    } finally {
      setSavingCategory(false);
    }
  };

  const openSkillCreate = (categoryId?: string) => {
    const fallback = categoryId || categories[0]?.id || "";
    if (!fallback) {
      setError("Créez d'abord une catégorie.");
      return;
    }
    setTab("skills");
    setEditingSkill(null);
    setSkillForm({ categoryId: fallback, name: emptyLocalized() });
    setSkillError("");
    setSkillModal(true);
  };

  const openSkillEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({ categoryId: skill.categoryId, name: { ...skill.name } });
    setSkillError("");
    setSkillModal(true);
  };

  const submitSkill = async (event: React.FormEvent) => {
    event.preventDefault();
    setSkillError("");
    if (!Object.values(skillForm.name).some((value) => value.trim())) {
      setSkillError("Ajoutez le nom de la compétence.");
      return;
    }
    setSavingSkill(true);
    try {
      if (editingSkill) await api.updateSkill(editingSkill.id, skillForm);
      else await api.createSkill(skillForm);
      setSkillModal(false);
      setNotice(editingSkill ? "Compétence mise à jour." : "Compétence ajoutée.");
      await load();
      await refreshPublic();
    } catch (saveError) {
      setSkillError(saveError instanceof Error ? saveError.message : "Échec de l'enregistrement");
    } finally {
      setSavingSkill(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      if (deleting.type === "category") await api.deleteCategory(deleting.id);
      else await api.deleteSkill(deleting.id);
      setNotice(deleting.type === "category" ? "Catégorie supprimée." : "Compétence supprimée.");
      setDeleting(null);
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
        title="Compétences"
        description="Organisez vos compétences par catégories, avec un intitulé dans les quatre langues."
        actions={
          <>
            <Button variant="secondary" icon={Layers} onClick={openCategoryCreate}>Nouvelle catégorie</Button>
            <Button icon={Plus} onClick={() => openSkillCreate()}>Nouvelle compétence</Button>
          </>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {[
            { id: "skills" as const, label: `Compétences (${skills.length})` },
            { id: "categories" as const, label: `Catégories (${categories.length})` },
          ].map((entry) => (
            <button
              key={entry.id}
              onClick={() => setTab(entry.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                tab === entry.id ? "bg-[#0F7DB8] text-white" : "text-slate-400 hover:text-white",
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="admin-input sm:max-w-[220px]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.en || category.name.fr || category.key}
              </option>
            ))}
          </select>
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher…"
              className="admin-input pl-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingList rows={4} />
      ) : tab === "categories" ? (
        categories.length === 0 ? (
          <Panel className="p-4">
            <EmptyState
              icon={Layers}
              title="Aucune catégorie"
              description="Créez une catégorie pour regrouper vos compétences."
              action={<Button icon={Plus} onClick={openCategoryCreate}>Créer une catégorie</Button>}
            />
          </Panel>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const count = skills.filter((skill) => skill.categoryId === category.id).length;
              return (
                <Panel key={category.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0F7DB8]/20 bg-[#0F7DB8]/10">
                      <Layers className="h-5 w-5 text-[#2196D3]" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" className="px-2 py-1.5" icon={Pencil} onClick={() => openCategoryEdit(category)}>
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 py-1.5 text-red-300 hover:bg-red-500/10"
                        icon={Trash2}
                        onClick={() =>
                          setDeleting({
                            type: "category",
                            id: category.id,
                            label: category.name.en || category.name.fr || category.key,
                          })
                        }
                      >
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">
                    {category.name.en || category.name.fr || category.key}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {category.key}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone="blue">{count} compétence{count > 1 ? "s" : ""}</Badge>
                    <button
                      onClick={() => openSkillCreate(category.id)}
                      className="text-xs font-bold text-[#2196D3] hover:text-[#6FC3F0]"
                    >
                      + Ajouter
                    </button>
                  </div>
                </Panel>
              );
            })}
          </div>
        )
      ) : visibleCategories.length === 0 ? (
        <Panel className="p-4">
          <EmptyState
            icon={Code2}
            title="Aucune compétence"
            description="Ajoutez vos technologies et expertises pour les afficher sur le portfolio."
            action={<Button icon={Plus} onClick={() => openSkillCreate()}>Ajouter une compétence</Button>}
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {visibleCategories.map(({ category, skills: categorySkills }) => (
            <Panel key={category.id} className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2196D3]" />
                  <h3 className="text-sm font-bold text-white">
                    {category.name.en || category.name.fr || category.key}
                  </h3>
                  <Badge tone="slate">{categorySkills.length}</Badge>
                </div>
                <Button variant="ghost" className="px-2 py-1.5 text-xs" icon={Plus} onClick={() => openSkillCreate(category.id)}>
                  Ajouter
                </Button>
              </div>

              {categorySkills.length === 0 ? (
                <p className="text-xs text-slate-500">Aucune compétence dans cette catégorie.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-3 pr-1.5 transition hover:border-[#0F7DB8]/30"
                    >
                      <span className="text-xs font-semibold text-slate-200">
                        {skill.name.en || skill.name.fr || skill.name.de || skill.name.ar}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openSkillEdit(skill)}
                          className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                          aria-label="Modifier"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleting({
                              type: "skill",
                              id: skill.id,
                              label: skill.name.en || skill.name.fr || "cette compétence",
                            })
                          }
                          className="rounded-md p-1 text-slate-500 transition hover:bg-red-500/20 hover:text-red-300"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={categoryModal}
        onClose={() => setCategoryModal(false)}
        title={editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCategoryModal(false)} disabled={savingCategory}>Annuler</Button>
            <Button type="submit" form="category-form" loading={savingCategory}>
              {editingCategory ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={submitCategory} className="space-y-5">
          {categoryError && <Alert type="error">{categoryError}</Alert>}
          <LocalizedField
            label="Nom de la catégorie"
            required
            value={categoryForm.name}
            onChange={(name) => setCategoryForm({ ...categoryForm, name })}
            placeholder="Backend Development"
          />
          <Field label="Clé technique" hint="Utilisée comme identifiant stable. Ex. : backend">
            <TextInput
              value={categoryForm.key}
              placeholder="backend"
              onChange={(event) => setCategoryForm({ ...categoryForm, key: event.target.value })}
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={skillModal}
        onClose={() => setSkillModal(false)}
        title={editingSkill ? "Modifier la compétence" : "Nouvelle compétence"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSkillModal(false)} disabled={savingSkill}>Annuler</Button>
            <Button type="submit" form="skill-form" loading={savingSkill}>
              {editingSkill ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="skill-form" onSubmit={submitSkill} className="space-y-5">
          {skillError && <Alert type="error">{skillError}</Alert>}
          <Field label="Catégorie" required>
            <select
              value={skillForm.categoryId}
              onChange={(event) => setSkillForm({ ...skillForm, categoryId: event.target.value })}
              className="admin-input"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.en || category.name.fr || category.key}
                </option>
              ))}
            </select>
          </Field>
          <LocalizedField
            label="Nom de la compétence"
            required
            value={skillForm.name}
            onChange={(name) => setSkillForm({ ...skillForm, name })}
            placeholder="Python"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.type === "category" ? "Supprimer la catégorie ?" : "Supprimer la compétence ?"}
        description={
          deleting?.type === "category"
            ? `« ${deleting.label} » et toutes ses compétences seront supprimées du portfolio.`
            : `« ${deleting?.label} » sera retirée du portfolio.`
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
