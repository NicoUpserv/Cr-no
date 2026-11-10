# Le cours avant la leçon — spécification

Source : échanges avec le client (Tarek, enseignant), 10 novembre 2026, et vidéo de test « Bien freiner » validée par une élève.
Statut : **à valider avec le client** (voir « Questions ouvertes »).

## Principe

Avant chaque leçon de conduite, l'élève suit un cours d'environ **15 minutes** sur le thème de la leçon. L'heure de conduite reste entière : c'est à l'élève de faire le cours avant. S'il ne l'a pas validé, l'enseignant est prévenu et décide s'il prend 15 minutes de la leçon pour expliquer.

## Structure d'un cours (environ 15 min)

| Étape | Durée | Contenu |
|---|---|---|
| 1. Vidéo(s) | ~5 min | Une vidéo ou plusieurs vidéos courtes (~1 min chacune). Format vertical 9:16 pour le téléphone (version horizontale possible). |
| 2. Fiche technique | ~5 min | Texte court, illustré, découpé en étapes. Lisible sur téléphone. |
| 3. Quiz | ~3 min | Questions tirées au hasard dans une banque (voir règles ci-dessous). |
| 4. Bilan | ~1 min | Les points à retenir. **À préciser avec le client** (voir questions). |
| 5. Ce que dit la loi | ~1 min | Article, amende, points retirés, risque de suspension ou de prison, et le conseil pratique. **Avec la source et la date de vérification.** |

Exemple fourni par le client : cours « Freinage », une vidéo par type de freinage (dégressif, progressif, linéaire, d'urgence).

## Règles du quiz

1. **Banque de questions par cours, plus grande que le quiz.** Pour 6 questions affichées, il faut au moins 15 à 18 questions dans la banque, sinon l'élève revoit vite les mêmes.
2. **Tirage aléatoire des questions ET de l'ordre des réponses.** Dans l'exemple du client, la bonne réponse est toujours B : un élève l'aurait remarqué en deux questions. L'ordre des réponses doit être mélangé à chaque passage.
3. **Explication après chaque réponse**, comme dans l'exemple du client (« Si tu ne regardes pas derrière, celui qui te suit peut te rentrer dedans. »). C'est ce qui fait apprendre.
4. **Seuil de réussite : 5 bonnes réponses sur 6** (environ 80 %). En dessous : « Relis la fiche et revois la vidéo », puis nouveau quiz avec de nouvelles questions.
5. **Questions générées par IA : oui, mais en brouillon.** L'IA propose des questions à partir de la fiche ; l'enseignant les relit et les valide avant qu'elles entrent dans la banque. Jamais de question générée et montrée directement à l'élève (risque d'erreur sur des règles de sécurité et de droit).
6. Ton : tutoiement, phrases courtes, vocabulaire d'auto-école (cf. `apps/mobile/PRODUCT.md`).

## Ce que voit l'enseignant

Trois états au lieu de « consulté / non consulté » :

| État | Signification | Affichage enseignant |
|---|---|---|
| **Non commencé** | L'élève n'a pas ouvert le cours | Alerte jaune avec preuve (« envoyé le…, jamais ouvert ») |
| **Commencé, quiz non réussi** | Ouvert, mais pas 5/6 | Alerte jaune avec preuve (« meilleur score 3/6, 2 tentatives ») |
| **Validé** | Quiz réussi | Aucune alerte ; l'enseignant voit le score et peut voir les questions ratées |

Bonus utile pour l'enseignant : les questions les plus ratées par l'élève, pour savoir quoi travailler en voiture.

## « Ce que dit la loi » : exigence de fiabilité

Les montants, points et sanctions changent et sont faciles à mal recopier. Chaque bloc « loi » doit contenir :
- le texte en langage simple ;
- la **référence** (article du Code de la route, lien Légifrance) ;
- la **date de dernière vérification**.

L'appli affichera « vérifié le … ». Sans référence, le bloc n'est pas publié.
⚠️ Dans l'exemple « ampoule grillée », certains montants sont à revérifier avant publication (par exemple, « feu stop = 135 € + 4 points » me paraît mélanger le défaut d'un feu et la circulation de nuit sans éclairage).

## Contenus : production et format

- **Vidéos** : motion design (style de la vidéo de test « Bien freiner » : schémas animés, étapes numérotées, synthèse finale). Production possible avec Claude Code (skills hyperframes / remotion), voix off, version verticale et horizontale.
- **Cohérence visuelle** : la vidéo de test utilise un bleu nuit et un orange ; l'appli utilise l'univers « La route » (bleu de panneau, jaune de signalisation, police condensée). Il faudra aligner les deux pour que cours et appli forment une seule identité (même bleu, même jaune à la place de l'orange, même police condensée).
- **Saisie des contenus** : le client doit pouvoir créer et modifier un cours (vidéos, fiche, banque de questions, bilan, loi) sans passer par un développeur. → Prévoir un **éditeur de cours** dans l'espace direction (phase 2), ou un import depuis un modèle Word / tableur en attendant.
- **Hébergement vidéo** : Bunny Stream (Europe), lecture adaptée à la connexion de l'élève.

## Modèle de données (proposition)

```ts
type Cours = {
  id: string;
  competence: 'C1' | 'C2' | 'C3' | 'C4';
  sousCompetence: string;          // ex. « Freiner »
  titre: string;                    // ex. « Le freinage dégressif »
  videos: { url: string; dureeSecondes: number; format: 'vertical' | 'horizontal' }[];
  fiche: { etapes: { titre: string; texte: string; imageUrl?: string }[] };
  banqueQuestions: QuestionQuiz[];  // ≥ 15 pour 6 affichées
  nbQuestionsAffichees: number;     // 6 par défaut
  seuilReussite: number;            // 5 par défaut
  bilan: string[];                  // points à retenir
  loi?: { texte: string; references: { libelle: string; url: string }[]; verifieLe: string };
  valideParEnseignant: boolean;
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

- **Phase 1** : lecteur de cours (vidéos, fiche, quiz aléatoire avec explications, bilan, loi), suivi des trois états, alertes enseignant. Contenus saisis par nous à partir des documents du client.
- **Phase 2** : éditeur de cours pour le client ; génération de questions par IA (brouillons à valider) ; statistiques des questions ratées.

## Questions ouvertes (à poser au client)

1. **Bilan** : c'est un résumé des points à retenir (comme « Rétro, fort, puis doux » à la fin de la vidéo) ou le récapitulatif du score de l'élève ?
2. **Freinage** : un cours « Freinage » avec 4 vidéos, ou 4 cours distincts (un par type), chacun lié à une leçon ?
3. **Quiz raté plusieurs fois** : on bloque la réservation de la leçon, ou on prévient seulement l'enseignant ? (Recommandation : seulement prévenir, la responsabilité reste à l'élève.)
4. **Qui valide les questions générées par IA** : le client seul, ou chaque auto-école pour ses élèves ?
5. **Contenus partagés ou par auto-école** : les cours de Créno sont-ils les mêmes pour toutes les auto-écoles, ou chaque auto-école peut-elle ajouter/modifier les siens ?
