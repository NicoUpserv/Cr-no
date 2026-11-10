# Le cours avant la leçon — spécification

Source : échanges avec le client (Tarek, enseignant), 10 novembre 2026, et vidéo de test « Bien freiner » validée par une élève.
Statut : **validé le 10/11/2026** (structure, quiz aléatoire avec réponses mélangées, trois états de suivi, charte des vidéos), **complété le 10/11/2026** avec les réponses du client (bilan, cours multi-vidéos et multi-fiches, catalogue commun). Restent les « Questions ouvertes ».

## Principe

Avant chaque leçon de conduite, l'élève suit un cours d'environ **15 minutes** sur le thème de la leçon. L'heure de conduite reste entière : c'est à l'élève de faire le cours avant. S'il ne l'a pas validé, l'enseignant est prévenu et décide s'il prend 15 minutes de la leçon pour expliquer.

## Structure d'un cours (environ 15 min)

| Étape | Durée | Contenu |
|---|---|---|
| 1. Vidéo(s) | ~5 min | Une ou **plusieurs** vidéos courtes (~1 min chacune). Format vertical 9:16 pour le téléphone (version horizontale possible). |
| 2. Fiche(s) technique(s) | ~5 min | Une ou **plusieurs** fiches : texte court, illustré, découpé en étapes. Lisible sur téléphone. |
| 3. Quiz | ~3 min | Questions tirées au hasard dans une banque (voir règles ci-dessous). |
| 4. Bilan | ~1 min | **Le résultat du quiz** (décision du client) : score, cours validé ou à refaire, et pour chaque question ratée la bonne réponse avec son explication. |
| 5. Ce que dit la loi | ~1 min | Article, amende, points retirés, risque de suspension ou de prison, et le conseil pratique, tels que rédigés par l'auto-école. |

Un cours peut donc réunir plusieurs vidéos et plusieurs fiches sur un même thème. Exemple donné par le client (illustration seulement, le cours sera refait) : le cours « Freinage » = **4 petites vidéos** (dégressif, progressif, linéaire, d'urgence) et **3 fiches techniques**, puis un seul quiz et un seul bilan.

## Règles du quiz

1. **Banque de questions par cours, plus grande que le quiz.** Pour 6 questions affichées, il faut au moins 15 à 18 questions dans la banque, sinon l'élève revoit vite les mêmes.
2. **Tirage aléatoire des questions ET de l'ordre des réponses.** Dans l'exemple du client, la bonne réponse est toujours B : un élève l'aurait remarqué en deux questions. L'ordre des réponses doit être mélangé à chaque passage.
3. **Explication après chaque réponse**, comme dans l'exemple du client (« Si tu ne regardes pas derrière, celui qui te suit peut te rentrer dedans. »). C'est ce qui fait apprendre.
4. **Seuil de réussite : 5 bonnes réponses sur 6** (environ 80 %). En dessous : « Relis la fiche et revois la vidéo », puis nouveau quiz avec de nouvelles questions.
5. **Origine des questions (décision du 10/11/2026)** :
   - d'abord **les questions déjà rédigées par le client** ;
   - s'il n'y en a pas assez, l'IA en **propose d'autres, à partir du contenu du cours uniquement** (vidéos, fiches), sans rien ajouter d'extérieur ;
   - **le client valide** chaque question proposée avant qu'elle entre dans la banque. Jamais de question générée et montrée directement à l'élève.
6. Ton : tutoiement, phrases courtes, vocabulaire d'auto-école (cf. `apps/mobile/PRODUCT.md`).

## Ce que voit l'enseignant

Trois états au lieu de « consulté / non consulté » :

| État | Signification | Affichage enseignant |
|---|---|---|
| **Non commencé** | L'élève n'a pas ouvert le cours | Alerte jaune avec preuve (« envoyé le…, jamais ouvert ») |
| **Commencé, quiz non réussi** | Ouvert, mais pas 5/6 | Alerte jaune avec preuve (« meilleur score 3/6, 2 tentatives ») |
| **Validé** | Quiz réussi | Aucune alerte ; l'enseignant voit le score et peut voir les questions ratées |

Bonus utile pour l'enseignant : les questions les plus ratées par l'élève, pour savoir quoi travailler en voiture.

## Catalogue commun et parcours par auto-école (décision du client)

- **Créno fournit les cours** : un catalogue commun à toutes les auto-écoles.
- **Une auto-école peut mettre ses propres cours** : il faut lui offrir cette possibilité (décision du 10/11/2026). Ce n'est pas le cas général : l'objectif est que l'élève obtienne son permis et sache bien conduire, sans le surcharger.
- **Chaque auto-école choisit l'ordre** des cours de son parcours :
  - **pendant l'onboarding** de l'auto-école (une étape « Ordre des cours », préremplie avec l'ordre par défaut de Créno) ;
  - **et ensuite dans les paramètres**, à tout moment.
- Conséquence technique : un catalogue global (`Cours`) + un parcours par auto-école (`ParcoursAutoEcole` : ordre des cours, cours ajoutés).

## « Ce que dit la loi »

Le contenu est celui du cours de l'auto-école : **l'appli l'affiche tel quel, sans le modifier** (décision du 10/11/2026). L'auto-école en est responsable.
Champs facultatifs mis à disposition : référence (article, lien Légifrance) et date de mise à jour, affichée « mis à jour le … » si renseignée.

## Contenus : production et format

- **Vidéos** : motion design (style de la vidéo de test « Bien freiner » : schémas animés, étapes numérotées, synthèse finale). Production possible avec Claude Code (skills hyperframes / remotion), voix off, version verticale et horizontale.
- **Charte graphique (décidé)** : les vidéos suivent la charte de Créno, univers « La route » : bleu de panneau, jaune de signalisation à la place de l'orange de la vidéo de test, police condensée Barlow Condensed, mêmes pictogrammes. Référence : `apps/mobile/src/theme/tokens.ts` (et `DESIGN.md` quand il existera).
- **Saisie des contenus** : le client doit pouvoir créer et modifier un cours (vidéos, fiche, banque de questions, bilan, loi) sans passer par un développeur. → Prévoir un **éditeur de cours** dans l'espace direction (phase 2), ou un import depuis un modèle Word / tableur en attendant.
- **Hébergement vidéo** : Bunny Stream (Europe), lecture adaptée à la connexion de l'élève.

## Protection des vidéos (demande du client)

Objectif : que les vidéos ne puissent pas être téléchargées depuis l'application. **Aucune solution n'est absolue** (on peut toujours filmer l'écran avec un autre appareil), mais on rend la copie difficile :

| Mesure | Où | Statut |
|---|---|---|
| Pas de bouton ni de fonction de téléchargement, pas d'image dans l'image, pas de cache | Appli (`expo-video`) | Fait |
| Captures et enregistrements d'écran bloqués pendant le cours | Android (FLAG_SECURE), iOS (masquage) via `expo-screen-capture` | Fait (rien d'équivalent sur le web) |
| Lecture en streaming découpé (HLS), jamais de fichier MP4 complet | Hébergement Bunny Stream | Mise en production |
| Liens signés et éphémères, réservés aux élèves connectés de l'auto-école | Bunny Stream + Supabase | Mise en production |
| Chiffrement DRM (FairPlay sur iOS, Widevine sur Android) | Bunny Stream (offre DRM) + `expo-video` | À décider (coût supplémentaire) |
| Filigrane discret avec le nom de l'élève | Lecteur | À décider (dissuasif contre les fuites) |

## Modèle de données (proposition)

```ts
type Cours = {
  id: string;
  competence: 'C1' | 'C2' | 'C3' | 'C4';
  sousCompetence: string;          // ex. « Freiner »
  titre: string;                    // ex. « Le freinage »
  videos: { titre: string; url: string; dureeSecondes: number; format: 'vertical' | 'horizontal' }[];
  fiches: { titre: string; etapes: { titre: string; texte: string; imageUrl?: string }[] }[];
  banqueQuestions: QuestionQuiz[];  // ≥ 15 pour 6 affichées
  nbQuestionsAffichees: number;     // 6 par défaut
  seuilReussite: number;            // 5 par défaut
  // Pas de champ « bilan » : le bilan est calculé à partir de la tentative (score + questions ratées).
  loi?: { texte: string; references?: { libelle: string; url: string }[]; misAJourLe?: string };
  /** null = cours du catalogue Créno ; sinon cours ajouté par cette auto-école. */
  autoEcoleId: string | null;
  valideParEnseignant: boolean;
};

/** Parcours d'une auto-école : l'ordre dans lequel ses élèves suivent les cours. */
type ParcoursAutoEcole = {
  autoEcoleId: string;
  ordreCoursIds: string[];          // cours du catalogue et cours ajoutés, dans l'ordre choisi
};

type QuestionQuiz = {
  id: string;
  enonce: string;
  reponses: { texte: string; correcte: boolean }[]; // ordre mélangé à l'affichage
  explication: string;
  origine: 'enseignant' | 'ia-validee';
};

type SuiviCours = {
  eleveId: string;
  coursId: string;
  statut: 'non-commence' | 'commence' | 'valide';
  tentatives: { date: string; score: number; total: number; questionsRateesIds: string[] }[];
};
```

Le type actuel `CoursPrealable` (`ouvertures`) sera remplacé par `SuiviCours`.

## Phasage

- **Phase 1** : lecteur de cours (plusieurs vidéos, plusieurs fiches, quiz aléatoire avec explications, bilan = résultat du quiz, loi), suivi des trois états, alertes enseignant (prévenir seulement), catalogue commun ; **ordre des cours réglable à l'onboarding et dans les paramètres** (simple liste à réordonner). Contenus saisis par nous à partir des documents du client.
- **Phase 2** : éditeur de cours (catalogue Créno + cours ajoutés par une auto-école) ; génération de questions par IA à partir du cours, validées par le client ; statistiques des questions ratées.

## Questions réglées le 10/11/2026

- **Bilan** = résultat du questionnaire.
- **Freinage** = un seul cours (4 petites vidéos, 3 fiches techniques).
- **Contenus** = catalogue commun ; chaque auto-école choisit l'ordre et peut ajouter des cours, sans surcharger l'élève.

- **Quiz raté plusieurs fois** : on **prévient seulement** l'enseignant, on ne bloque pas la réservation.
- **Questions** : celles du client d'abord, complétées si besoin par l'IA à partir du cours uniquement, toutes validées par le client.
- **Cours des auto-écoles** : Créno fournit le catalogue ; une auto-école peut ajouter ses cours ; l'ordre se règle à l'onboarding et dans les paramètres.

- **Cours ajoutés par une auto-école** : l'auto-école les gère elle-même (contenus et questions) ; Créno ne les valide pas.

## Points à suivre

1. **Origine des questions** : règle valable « pour l'instant », à revoir avec le client plus tard.
2. **Droits sur le catalogue Créno** (pris en compte, à régler avant la commercialisation) : « on va fournir des cours » — le catalogue doit appartenir à Créno. Si des cours viennent de l'auto-école où travaille le client (« c'est le cours de son auto-école »), il faut l'accord écrit de son propriétaire (l'auto-école ou son gérant), ou que Créno produise ses propres versions. **À régler avant la commercialisation.** Les cours ajoutés par une auto-école restent sa propriété (à préciser dans les conditions d'utilisation).
