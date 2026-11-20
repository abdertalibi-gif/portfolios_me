import { readFileSync, writeFileSync } from "node:fs";

const edits = [
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `        eyebrow="Parcours"
        title="Gestion des expériences"
        description="Ajoutez et organisez vos expériences professionnelles et missions avec détails traduits."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouvelle expérience
          </Button>
        }`,
    `        eyebrow="Parcours académique"
        title="Gestion des projets académiques"
        description="Ajoutez et organisez vos projets académiques et personnels, avec détails traduits."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouveau projet
          </Button>
        }`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `            title="Aucune expérience enregistrée"
            description="Ajoutez une expérience professionnelle pour enrichir votre parcours sur le portfolio."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une expérience</Button>}`,
    `            title="Aucun projet académique enregistré"
            description="Ajoutez un projet académique ou personnel pour enrichir votre parcours sur le portfolio."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter un projet</Button>}`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `title={editing ? "Modifier l'expérience" : "Nouvelle expérience"}`,
    `title={editing ? "Modifier le projet" : "Nouveau projet"}`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `              label="Poste occupé"
              required
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
              placeholder="Software Engineer & AI Developer"`,
    `              label="Intitulé du projet"
              required
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
              placeholder="PrésenceQR — système de gestion des présences"`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `              label="Entreprise / organisation"`,
    `              label="Cadre / organisation"`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `title="Supprimer cette expérience ?"`,
    `title="Supprimer ce projet ?"`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `setError(loadError instanceof Error ? loadError.message : "Impossible de charger les expériences");`,
    `setError(loadError instanceof Error ? loadError.message : "Impossible de charger les projets");`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `setFormError("Ajoutez un intitulé de poste dans au moins une langue.");`,
    `setFormError("Ajoutez un intitulé de projet dans au moins une langue.");`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `setNotice(editing ? "Expérience mise à jour." : "Expérience ajoutée avec succès.");`,
    `setNotice(editing ? "Projet mis à jour." : "Projet ajouté avec succès.");`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `setNotice("Expérience supprimée.");`,
    `setNotice("Projet supprimé.");`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `          <Field label="Type d'emploi">`,
    `          <Field label="Type de projet">`,
  ],
  [
    "src/pages/admin/ExperienceAdmin.tsx",
    `              <option value="">Sélectionner un type</option>`,
    `              <option value="">Sélectionner un type</option>`,
  ],
  [
    "src/pages/admin/CertificationsAdmin.tsx",
    `        eyebrow="Réalisations"
        title="Gestion des certifications"
        description="Ajoutez et organisez vos certificats, diplômes professionnels et accréditations."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouvelle certification
          </Button>
        }`,
    `        eyebrow="Réalisations"
        title="Gestion des réalisations"
        description="Ajoutez et organisez vos distinctions académiques, jalons et projets mis en avant."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nouvelle réalisation
          </Button>
        }`,
  ],
  [
    "src/pages/admin/CertificationsAdmin.tsx",
    `            title="Aucune certification enregistrée"
            description="Ajoutez vos certificats pour prouver vos compétences certifiées sur le portfolio."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une certification</Button>}`,
    `            title="Aucune réalisation enregistrée"
            description="Ajoutez vos distinctions académiques et jalons marquants pour enrichir le portfolio."
            action={<Button icon={Plus} onClick={openCreate}>Ajouter une réalisation</Button>}`,
  ],
  [
    "src/pages/admin/CertificationsAdmin.tsx",
    `                    <Badge tone="green">
                      <Award className="h-3 w-3 mr-0.5 inline" />
                      Certifié
                    </Badge>`,
    `                    <Badge tone="green">
                      <Award className="h-3 w-3 mr-0.5 inline" />
                      Réalisation
                    </Badge>`,
  ],
  [
    "src/pages/admin/CertificationsAdmin.tsx",
    `        title={editing ? "Modifier la certification" : "Nouvelle certification"}`,
    `        title={editing ? "Modifier la réalisation" : "Nouvelle réalisation"}`,
  ],
  [
    "src/pages/admin/CertificationsAdmin.tsx",
    `                    <span>Vérifier le certificat</span>`,
    `                    <span>Voir le projet</span>`,
  ],
];

for (const [file, from, to] of edits) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(from)) {
    console.log("MISS", file, JSON.stringify(from.slice(0, 60)));
    continue;
  }
  writeFileSync(file, text.replace(from, to), "utf8");
  console.log("ok", file, JSON.stringify(to.slice(0, 40)));
}
