---
version: 1
slug: "src-app-tabs-eleves-id-tsx"
primary_target: "src/app/(tabs)/eleves/[id].tsx"
related_targets: []
---

## Scope

Fiche élève vue par l'enseignant (écran poussé depuis la liste des élèves ou la journée). Mode : Operate. Plateformes : iOS et Android natifs (adaptive), web en secours.

## Audience & task

Enseignant de la conduite, souvent dans la voiture entre deux leçons : savoir en un coup d'œil où l'élève en est, ce qui manque (cours non consulté, pièces du dossier), et où et quand a lieu la prochaine leçon, avec l'itinéraire à un appui.

## Direction contract

THESIS: L'univers de la route sur un squelette entièrement natif. Chaque signe routier a un seul rôle : panneau directionnel = prochaine leçon, ligne de chaussée = progression, cartouche = numéro de leçon, jaune de chantier = attention, tampon = compétence validée. Refuse l'écran standard avatar + onglets segmentés + barres de progression.

OWN-WORLD: Fond neutre clair calé sur une rampe de 9 pas, bleu de panneau directionnel (#1D4E9E) comme unique teinte interactive, bande bitume (#2B2F33) pour la progression, jaune de signalisation temporaire (#F2C230) réservé à l'attention, rouge réservé aux erreurs et aux tampons de validation. Texte et contrôles en police système (SF / Roboto) ; chiffres et cartouches dans un condensé gras auto-hébergé ; chiffres tabulaires partout.

STORY: L'enseignant ouvre la fiche, lit la prochaine leçon (lieu, heure, fin) et lance l'itinéraire ; il voit C1 à C4 et ce qui reste ; il repère ce qui demande son attention ; il descend vers le dossier, les observations et le livret.

FIRST VIEWPORT: Barre de navigation native (retour « Élèves », « Modifier »), grand titre natif avec le nom, ligne « Permis B · cartouche L14 · sur 20 ». En-tête de section natif « Prochaine leçon », puis le panneau bleu à liseré blanc : lieu de départ en grand, heure en grand à droite, « Fin : lieu · heure », « dans 35 min », bouton « Itinéraire » (action principale). Bande bitume C1 à C4 en lignes continues (acquis, avec tampon) ou discontinues (en cours, compteur x / y). Bloc d'attention jaune avec sa preuve (envoyé le…, ouvert n fois). Listes groupées natives : Dossier, Observations, Livret.

FORM: Fusion choisie par l'utilisateur (« La route ») des directions grounded carte routière, livret tamponné, panneau directionnel, fiche horaire et lignes de chaussée ; épinglée par l'utilisateur. seed:0c9ed7d89fe5679a

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

Validation d'une compétence : la ligne discontinue se referme en ligne continue et le tampon se pose (une seule animation, respect de Réduire les animations).

## Unresolved

Nom définitif de l'application ; teinte par auto-école (le bleu de panneau reste la teinte par défaut).
