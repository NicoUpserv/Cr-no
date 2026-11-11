# La fiche de leçon — spécification

Source : document Word du client et précisions du 11 novembre 2026.
Statut : **à valider avec le client** (voir « Questions ouvertes »).

## Principe

Après chaque leçon de conduite, l'enseignant remplit une fiche courte, depuis son téléphone, en moins d'une minute. Elle alimente le livret d'apprentissage de l'élève et informe l'équipe.

## 1. Appréciation des thèmes travaillés (décision du 11/11/2026)

Pour chaque thème travaillé pendant la leçon (ex. « Insertion sur voie rapide », « Freinage »), l'enseignant choisit une appréciation parmi trois :

| Appréciation | Sens | Effet |
|---|---|---|
| **Vu** | Abordé pendant la leçon, pas encore évalué | Reste à travailler |
| **Acquis** | L'élève le maîtrise | Compte dans la progression C1 à C4 (la ligne de chaussée devient continue quand tous les thèmes d'une compétence sont acquis) |
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
- Thèmes de la leçon préremplis (ceux du cours de la leçon), en plus de ceux que l'enseignant ajoute.
- Appréciation en trois boutons par thème.
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
  themes: { themeId: string; competence: 'C1' | 'C2' | 'C3' | 'C4'; appreciation: Appreciation }[];
  observationPartagee?: string;   // élève + enseignants + direction
  observationInterne?: string;    // enseignants + direction uniquement
  aSignaler: boolean;             // affiche l'observation interne en alerte pour l'équipe
};
```

Contrôle d'accès (base de données) : la colonne `observationInterne` n'est jamais renvoyée à un compte élève ou parent — la règle est appliquée côté serveur (sécurité au niveau des lignes et des colonnes), pas seulement masquée dans l'interface.

## Questions ouvertes

1. **Appréciation par thème ou par sous-compétence du livret** ? (Proposition : par thème de cours, rattaché à une sous-compétence du livret REMC.)
2. **Qui peut modifier une fiche** après coup : seulement son auteur, ou aussi la direction ?
3. **Durée de conservation** des observations internes.
