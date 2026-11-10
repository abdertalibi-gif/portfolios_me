import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <PageHeader
        eyebrow="Contenu"
        title="Compétences"
        description="Organisez vos technologies et compétences par catégories, avec un libellé dans les quatre langues."
        actions={
          <>
            <Button variant="secondary" icon={Layers} onClick={openCategoryCreate}>
              Nouvelle catégorie
            </Button>
            <Button icon={Plus} onClick={() => openSkillCreate()}>
              Nouvelle compétence
            </Button>
          </>
        }
      />

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert type="success" onClose={() => setNotice("")}>{notice}</Alert>}

      {/* Toolbar: Segmented Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: View Tabs */}
        <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#081127] p-1 self-start">
          <button
            type="button"
            onClick={() => setTab("skills")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              tab === "skills"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            Compétences ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
              tab === "categories"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            Catégories ({categories.length})
          </button>
        </div>

        {/* Right: Category filter & Search Input */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {tab === "skills" && (
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="h-[38px] rounded-lg bg-[#081127] border border-white/10 px-3 text-xs sm:text-sm text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.fr || category.name.en || category.key}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une compétence..."
              className="h-[38px] w-full rounded-lg bg-[#081127] border border-white/10 pl-9 pr-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingList rows={3} />
      ) : tab === "categories" ? (
        categories.length === 0 ? (
          <Panel>
            <EmptyState
              icon={Layers}
              title="Aucune catégorie"
              description="Créez une première catégorie pour regrouper vos compétences."
              action={<Button icon={Plus} onClick={openCategoryCreate}>Créer une catégorie</Button>}
            />
          </Panel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = skills.filter((skill) => skill.categoryId === category.id).length;
              return (
                <Panel
                  key={category.id}
                  className="p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-150"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-cyan-400">
                        <Layers className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openCategoryEdit(category)}
                          className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                          aria-label="Modifier la catégorie"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleting({
                              type: "category",
                              id: category.id,
                              label: category.name.fr || category.name.en || category.key,
                            })
                          }
                          className="rounded p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          aria-label="Supprimer la catégorie"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-white">
                      {category.name.fr || category.name.en || category.key}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {category.key}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <Badge tone="blue">
                      {count} compétence{count > 1 ? "s" : ""}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => openSkillCreate(category.id)}
                      className="text-xs font-semibold text-blue-400 hover:text-cyan-300 transition cursor-pointer"
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
        <Panel>
          <EmptyState
            icon={Code2}
            title="Aucune compétence trouvée"
            description={
              search
                ? "Aucune compétence ne correspond à votre recherche."
                : "Ajoutez vos compétences techniques pour les afficher sur le portfolio."
            }
            action={
              <Button icon={Plus} onClick={() => openSkillCreate()}>
                Ajouter une compétence
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {visibleCategories.map(({ category, skills: categorySkills }) => (
            <Panel
              key={category.id}
              className="p-4 sm:p-5 hover:border-white/20 transition-all duration-150"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  <h3 className="text-sm font-bold text-white">
                    {category.name.fr || category.name.en || category.key}
                  </h3>
                  <Badge tone="slate">
                    {categorySkills.length}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => openSkillCreate(category.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-cyan-300 hover:bg-blue-500/10 px-2 py-1 rounded transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>

              {/* Skills Tags List */}
              <div className="mt-3 pt-3 border-t border-white/5">
                {categorySkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    Aucune compétence dans cette catégorie.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-200 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all"
                      >
                        <span className="font-medium">
                          {skill.name.fr || skill.name.en || skill.name.de || skill.name.ar}
                        </span>
                        <div className="flex items-center gap-0.5 border-l border-white/10 pl-1.5 ml-0.5">
                          <button
                            type="button"
                            onClick={() => openSkillEdit(skill)}
                            className="rounded p-0.5 text-slate-400 hover:text-blue-300 hover:bg-white/10 transition cursor-pointer"
                            aria-label={`Modifier ${skill.name.fr || skill.name.en}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleting({
                                type: "skill",
                                id: skill.id,
                                label: skill.name.fr || skill.name.en || "cette compétence",
                              })
                            }
                            className="rounded p-0.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            aria-label={`Supprimer ${skill.name.fr || skill.name.en}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Modal: Catégorie */}
      <Modal
        open={categoryModal}
        onClose={() => setCategoryModal(false)}
        title={editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCategoryModal(false)} disabled={savingCategory}>
              Annuler
            </Button>
            <Button type="submit" form="category-form" loading={savingCategory}>
              {editingCategory ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={submitCategory} className="space-y-4">
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

      {/* Modal: Compétence */}
      <Modal
        open={skillModal}
        onClose={() => setSkillModal(false)}
        title={editingSkill ? "Modifier la compétence" : "Nouvelle compétence"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSkillModal(false)} disabled={savingSkill}>
              Annuler
            </Button>
            <Button type="submit" form="skill-form" loading={savingSkill}>
              {editingSkill ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <form id="skill-form" onSubmit={submitSkill} className="space-y-4">
          {skillError && <Alert type="error">{skillError}</Alert>}
          <Field label="Catégorie" required>
            <select
              value={skillForm.categoryId}
              onChange={(event) => setSkillForm({ ...skillForm, categoryId: event.target.value })}
              className="w-full h-[38px] rounded-lg bg-[#081127] border border-white/10 px-3 text-sm text-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.fr || category.name.en || category.key}
                </option>
              ))}
            </select>
          </Field>
          <LocalizedField
            label="Nom de la compétence"
            required
            value={skillForm.name}
            onChange={(name) => setSkillForm({ ...skillForm, name })}
            placeholder="Python, React, Docker..."
          />
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.type === "category" ? "Supprimer la catégorie ?" : "Supprimer la compétence ?"}
        description={
          deleting?.type === "category"
            ? `« ${deleting.label} » et toutes ses compétences associées seront supprimées du portfolio.`
            : `« ${deleting?.label} » sera retirée du portfolio.`
        }
        loading={deletingBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
