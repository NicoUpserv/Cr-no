# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Trois profils prioritaires **à égalité** dès la première version :

- **Élève** (15-25 ans en majorité, conduite accompagnée dès 15 ans) : réserve ses leçons, prépare le cours avant chaque leçon, suit sa progression code et conduite, paie, signe sa présence (CPF).
- **Enseignant de la conduite (moniteur)**, salarié d'une auto-école ou indépendant rattaché à plusieurs auto-écoles : gère ses disponibilités et absences, suit ses élèves, remplit les fiches de leçon. Il utilise l'appli **dans la voiture entre deux leçons**, souvent dehors, avec peu de temps.
- **Direction / responsable de l'auto-école** : pilote les plannings, les élèves, les enseignants, les documents, les examens. **Point de douleur confirmé :** avec son logiciel actuel, le patron du client doit venir au bureau pour modifier des disponibilités, car l'outil n'existe que sur ordinateur. La direction doit donc pouvoir tout piloter **depuis son téléphone**, pas seulement depuis un poste fixe.

Autre audience : le représentant légal d'un élève mineur (lecture seule).

## Product Purpose

Donner aux auto-écoles indépendantes et aux enseignants indépendants une application aussi moderne que les auto-écoles en ligne (Stych, Ornikar, En Voiture Simone), tout en restant indépendants. Succès : moins de créneaux vides, des élèves qui arrivent préparés à leur leçon, une direction qui gère tout où qu'elle soit, une migration facile depuis l'ancien logiciel.

## Positioning

Outil B2B2C vendu aux auto-écoles et aux enseignants indépendants, pas une auto-école en ligne concurrente. Mécanismes distinctifs :
- disponibilités routinières + ouvertures ponctuelles, avec alerte ciblée aux élèves dont les préférences (créneaux, enseignants favoris) correspondent ; liste d'attente sur annulation ;
- cours avant la leçon (~15 min : une ou plusieurs vidéos, une ou plusieurs fiches techniques, quiz aléatoire avec explications, bilan = résultat du quiz, « ce que dit la loi » ; catalogue commun à toutes les auto-écoles, ordre choisi par chaque auto-école) sous la responsabilité de l'élève ; validé par un quiz réussi (5/6), alerte à l'enseignant sinon (l'heure de conduite reste entière). Détail : `docs/cours-avant-lecon.md` ;
- fiche de leçon après chaque leçon : appréciation de chaque thème (vu / acquis / non maîtrisé), observation partagée (élève, enseignants, direction) et observation interne (enseignants et direction, avec signalement à l'équipe). Détail : `docs/fiche-de-lecon.md` ;
- quiz du cours verrouillé tant que les vidéos n'ont pas été regardées en entier et les fiches parcourues ;
- parcours d'examen enregistrés, annotés et rejoués en « GPS du parcours » ;
- enseignant indépendant : planning consolidé sur plusieurs auto-écoles ;
- gestion complète par la direction depuis le mobile.

## Operating Context

- Auto-écoles françaises (réglementation française : livret d'apprentissage numérique obligatoire, référentiel REMC, compétences 1 à 4, numéro NEPH, ASSR, CPF, conduite accompagnée AAC, conduite supervisée CS).
- Leçons de conduite d'une heure, point de rendez-vous et lieu de fin pouvant différer ; retard enregistré automatiquement au bout de 10 minutes.
- Enseignant en mouvement, téléphone tenu à une main ou posé sur un support ; ne manipule pas le téléphone en roulant.
- Direction au bureau ou en déplacement.

## Capabilities and Constraints

- Une seule application (iOS, Android, web) habillée aux couleurs et au logo de chaque auto-école (multi-auto-écoles).
- Stack existant : Expo SDK 58, Expo Router, TypeScript, pnpm workspace (`apps/mobile`).
- Terminologie : « enseignant » ou « moniteur », « élève », « direction », « leçon », « créneau », « livret », « compétence », « examen blanc », « parcours d'examen », « zones de travail ».
- Une partie du code sera écrite par un modèle exécutant (DeepSeek ou GLM via opencode) : le design system doit être strict et vérifiable (tokens et composants obligatoires, pas de valeurs en dur).
- Indécis : nom définitif (« Créno » favori, à valider et déposer), contenus pédagogiques (le client en possède une partie).

## Brand Commitments

- Nom provisoire : **Créno** (double sens : créneau horaire et manœuvre).
- Exigence du client : **l'application ne doit pas ressembler à une application générée par une IA.**
- Rendu **natif par système** : codes iOS sur iPhone, codes Android sur Android.
- Ton : **tutoiement côté élève, vouvoiement côté professionnels** (direction, échanges avec les auto-écoles). Textes courts, concrets, dans le vocabulaire des auto-écoles.
- Logo de l'auto-école pilote disponible (dans le Word du client), utilisé seulement comme exemple d'habillage.

## Evidence on Hand

- Document du client décrivant les écrans attendus : `../../maquette application auto ecole.docx` (hors dépôt).
- Analyse validée : `../../Creno - Analyse du projet.pdf` (hors dépôt).
- Aucun témoignage, client, chiffre de réussite ou partenaire réel à ce jour : ne pas en inventer. Les données d'exemple sont fictives.

## Product Principles

1. Chaque profil fait son travail principal en moins de trois gestes, depuis le téléphone.
2. L'information utile au bon moment : la prochaine leçon, ce qu'il faut préparer, ce qui manque.
3. La responsabilité est claire : l'élève prépare, l'enseignant constate, la direction décide.
4. La confiance avant tout : données personnelles et de mineurs protégées, rien d'inventé.
5. Changer d'outil doit être facile : reprise des données sans ressaisie.

## Accessibility & Inclusion

Lisibilité en plein soleil (usage en voiture et en extérieur), cibles tactiles généreuses, contraste conforme WCAG AA, compatibilité avec les tailles de police système (Dynamic Type / échelle Android).
