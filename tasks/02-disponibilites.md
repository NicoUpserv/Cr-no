# Tâche 02 — Formulaire « Mes disponibilités » (niveau : moyen)

Lis d'abord `apps/mobile/AGENTS.md` et l'écran de référence `apps/mobile/src/app/(tabs)/eleves/[id].tsx`.
Tout le travail se fait dans `apps/mobile/`.

## Objectif

L'enseignant gère depuis son téléphone : ses horaires habituels (routine hebdomadaire), ses ouvertures ponctuelles (ex. un samedi) et ses absences. Les erreurs de saisie sont signalées clairement avant l'enregistrement.

## Fichiers à créer ou modifier (et AUCUN autre)

1. `src/features/disponibilites/valider.ts` (créer)
2. `src/features/disponibilites/valider.test.ts` (créer)
3. `src/app/(tabs)/plus/disponibilites.tsx` (remplacer le contenu actuel)

Types à utiliser (déjà définis, ne pas les modifier) : `DisponibilitesMoniteur`, `DisponibiliteRoutine`, `OuverturePonctuelle`, `Absence`, `MotifAbsence` dans `src/data/types.ts`.

## 1. Logique : `src/features/disponibilites/valider.ts`

Contrat exact (des tests cachés l'utilisent) :

```ts
import type { DisponibilitesMoniteur } from '@/data/types';

export type ErreurDisponibilite = {
  /** Chemin du champ : 'routine.0.fin', 'ouvertures.1.date', 'absences.0.au'… */
  champ: string;
  message: string;
};

/** `aujourdHui` au format 'YYYY-MM-DD'. Renvoie [] si tout est valide. */
export function validerDisponibilites(d: DisponibilitesMoniteur, aujourdHui: string): ErreurDisponibilite[];
```

Règles (messages EXACTS) :

| # | Règle | Champ | Message |
|---|---|---|---|
| R1 | Toute heure doit être au format `HH:MM` entre `00:00` et `23:59` | `<section>.<i>.debut` ou `.fin` | `Heure invalide : utilisez le format HH:MM (ex. 08:30).` |
| R2 | La fin doit être strictement après le début (si les deux heures sont valides) | `<section>.<i>.fin` | `L'heure de fin doit être après l'heure de début.` |
| R3 | Dans la routine, deux créneaux du même jour ne se chevauchent pas (se toucher, 12:00 puis 12:00, est permis). L'erreur va sur le créneau d'indice le plus grand | `routine.<i>.debut` | `Ce créneau chevauche un autre créneau du même jour.` |
| R4 | Une ouverture a une date valide `YYYY-MM-DD` (date réelle du calendrier) et ≥ `aujourdHui` | `ouvertures.<i>.date` | `La date doit être aujourd'hui ou plus tard.` |
| R5 | Une absence a `du` ≤ `au` (dates valides) | `absences.<i>.au` | `La date de fin doit être après la date de début.` |

- `<section>` vaut `routine`, `ouvertures` ou `absences` (absences : pas d'heures, seulement R5).
- R3 ne s'applique qu'aux créneaux dont les deux heures sont valides et dans le bon ordre.
- Ordre du résultat : routine, puis ouvertures, puis absences ; dans chaque section par indice croissant ; pour un même élément : `date`, `debut`, `fin`, `du`, `au`.

Écris au moins 8 tests dans `valider.test.ts`.

## 2. Écran : `src/app/(tabs)/plus/disponibilites.tsx`

- Titre natif « Mes disponibilités » (pas de grand titre), bouton natif « Enregistrer » à droite de la barre (`headerRight`).
- État initial : `disponibilitesDuMoniteur(idMoniteurConnecte())` (de `@/data/depot`), conservé dans un état local (pas de sauvegarde serveur).
- Trois `Section` :
  1. « Horaires habituels » : une ligne par créneau (jour en toutes lettres : lundi…dimanche, champs `TextInput` début et fin), suppression possible, action « Ajouter un créneau ».
  2. « Ouvertures ponctuelles » : date (`YYYY-MM-DD`), début, fin ; suppression ; « Ajouter une ouverture ». Texte d'aide (`pied`) : « Les élèves qui vous ont en favori et dont les horaires correspondent seront prévenus. »
  3. « Absences » : du, au, motif (repos, congés, maladie, autre) ; suppression ; « Ajouter une absence ».
- « Enregistrer » → `validerDisponibilites(…)` ; erreurs affichées sous le champ concerné (texte ton `danger`) ; sans erreur → `Alert.alert('Disponibilités enregistrées')`.
- Champs : `TextInput` natifs, couleurs du thème, cible tactile ≥ `cibleTactile`, `accessibilityLabel` explicites (« Début du créneau du lundi »…).
- Pour choisir le jour d'un créneau et le motif d'une absence, utilise un composant natif simple (`ActionSheetIOS` sur iOS / `Alert` avec boutons sur Android, ou une ligne qui fait défiler les valeurs à l'appui) — pas de dépendance nouvelle.

## Fini quand

- `pnpm check` passe ;
- aucune couleur, taille ou police en dur ;
- seuls les 3 fichiers ci-dessus sont touchés.
