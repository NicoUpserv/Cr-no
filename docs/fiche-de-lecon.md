# La fiche de leçon — spécification

Source : document Word du client et précisions du 11 novembre 2026.
Statut : **réponses du client reçues le 11/11/2026** (voir en fin de document), deux points à vérifier (niveaux officiels du livret, durée de conservation).

## Principe

Après chaque leçon de conduite, l'enseignant remplit une fiche courte, depuis son téléphone, en moins d'une minute. Elle alimente le livret d'apprentissage de l'élève et informe l'équipe.

## 1. Appréciation des sous-compétences travaillées (décision du 11/11/2026)

Pour chaque sous-compétence du livret REMC travaillée pendant la leçon (ex. « C1 · Installation au poste de conduite », « C3 · S'insérer sur une voie rapide »), l'enseignant choisit une appréciation parmi trois :

| Appréciation | Sens | Effet |
|---|---|---|
| **Vu** | Abordé pendant la leçon, pas encore évalué | Reste à travailler |
| **Acquis** | L'élève le maîtrise | Compte dans la progression C1 à C4 (la ligne de chaussée devient continue quand toutes les sous-compétences d'une compétence sont acquises) |
| **Non maîtrisé** | Travaillé, mais pas encore réussi | Le cours correspondant est reproposé à l'élève avant la prochaine leçon |

L'élève voit ses appréciations dans son livret.

## 2. Deux observations (décision du 11/11/2026)

| Observation | Qui la voit | Usage |
|---|---|---|
| **Observation partagée** | L'élève, les enseignants, la direction de l'auto-école | Ce qui s'est bien passé, ce qu'il faut travailler. Ton : tutoiement, constructif. |
| **Observation interne** | Les enseignants et la direction **uniquement** (jamais l'élève) | Prévenir l'équipe : comportement dangereux, stress important, besoin d'adapter les leçons… |

**Signalement à l'équipe** : une observation interne peut être marquée « À signaler ». Elle apparaît alors en alerte sur la fiche de l'élève pour tout enseignant qui a une leçon avec lui, et dans l'accueil de la direction.

### ⚠️ Point juridique important (RGPD)

L'observation interne n'est **pas secrète au sens de la loi**. L'élève (ou ses parents s'il est mineur) peut demander l'accès à **toutes** les données qui le concernent, y compris ces notes (droit d'accès, article 15 du RGPD). Conséquences :
- les observations internes doivent rester **factuelles et professionnelles** (« A freiné tardivement à deux reprises en approche de passage piéton »), jamais insultantes ou subjectives (« élève nul, dangereux ») ;
- l'appli le rappelle discrètement au moment de la saisie ;
- les observations sont conservées pour une durée limitée (à définir, par exemple jusqu'à la fin de la formation plus un an).

## 3. Saisie rapide

- Ouverture automatique de la fiche à la fin de la leçon (ou depuis le planning).
- Sous-compétences préremplies (celles du cours de la leçon), en plus de celles que l'enseignant ajoute.
- Appréciation en trois boutons par sous-compétence.
- Bouton « Valider la fiche » : après validation, l'enseignant ne peut plus la modifier (voir réponses du client).
- Les deux observations en texte libre, avec **dictée vocale** possible (fonction prévue dans le plan : débrief vocal transformé en fiche).
- Signature électronique de présence (CPF) déjà prévue en début de leçon.

## Modèle de données (proposition)

```ts
type Appreciation = 'vu' | 'acquis' | 'non-maitrise';

type FicheLecon = {
  leconId: string;
  eleveId: string;
  enseignantId: string;
  date: string;
  // Une entrée par sous-compétence du livret REMC travaillée pendant la leçon.
  sousCompetences: { sousCompetenceId: string; competence: 'C1' | 'C2' | 'C3' | 'C4'; appreciation: Appreciation }[];
  observationPartagee?: string;   // élève + enseignants + direction
  observationInterne?: string;    // enseignants + direction uniquement
  aSignaler: boolean;             // affiche l'observation interne en alerte pour l'équipe
  valideeLe: string;              // après validation : plus modifiable par l'enseignant
  corrections: { par: string; le: string; champ: string; avant: string; apres: string }[]; // direction uniquement
};
```

Contrôle d'accès (base de données) : la colonne `observationInterne` n'est jamais renvoyée à un compte élève ou parent — la règle est appliquée côté serveur (sécurité au niveau des lignes et des colonnes), pas seulement masquée dans l'interface.

## Réponses du client (11/11/2026)

1. **L'appréciation se fait par sous-compétence du livret REMC** (ex. « C1 · Installation au poste de conduite »), pas par thème de cours. Chaque cours du catalogue est rattaché à une ou plusieurs sous-compétences ; la fiche préremplit les sous-compétences du cours de la leçon.
   - ⚠️ À vérifier avant le développement : le libellé exact des niveaux d'évaluation du livret numérique officiel (arrêté du 19/12/2023 et annexe de l'arrêté du 12/05/2014 modifié). Si le texte impose ses propres intitulés, « vu / acquis / non maîtrisé » doit s'y caler, sinon le livret de Créno ne sera pas conforme.
2. **Une fiche validée n'est plus modifiable par l'enseignant.** Seule la direction peut la corriger.
   - Chaque correction est historisée (qui, quand, valeur avant / après) et l'original reste consultable : c'est ce qui donne sa valeur de preuve à la fiche en cas de litige.
   - La direction doit pouvoir corriger : c'est aussi elle qui répond aux demandes de rectification d'un élève (droit de rectification, article 16 du RGPD).
3. **Conservation : « à vie, jusqu'à l'archivage du dossier ».**
   - ⚠️ **Pas possible tel quel.** Le RGPD (article 5.1.e) interdit de garder des données personnelles sans durée limitée. Il faut une durée écrite, fixée par l'auto-école (responsable de traitement) et indiquée aux élèves.
   - Proposition à faire valider : dossier **actif** pendant la formation ; **archivé** à la fin (permis obtenu, abandon ou transfert), en lecture seule pour la direction uniquement ; **suppression automatique** au bout d'une durée fixe après l'archivage (par exemple 3 ans pour les observations internes, plus si une obligation légale l'exige pour le livret ou la facturation : à vérifier).
   - L'appli fait l'archivage et la suppression automatiquement ; la direction voit la date de suppression prévue.
