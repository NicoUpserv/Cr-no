# Tâche 03 — Moteur d'alerte « créneau inhabituel » (niveau : difficile)

Lis d'abord `apps/mobile/AGENTS.md`. Tout le travail se fait dans `apps/mobile/`.

## Contexte métier

Un enseignant a des horaires habituels (routine). Quand il ouvre un créneau **en dehors** de ses habitudes (ex. un samedi matin), on prévient les élèves qui l'ont en **favori** et dont les **horaires préférés** correspondent, pour qu'ils réservent.

## Fichiers à créer (et AUCUN autre)

1. `src/features/alertes/a-notifier.ts`
2. `src/features/alertes/a-notifier.test.ts` : copie EXACTE de `tasks/fixtures/a-notifier.test.ts` (tests de base, ne pas les modifier).
3. `src/features/alertes/a-notifier.cas.test.ts` : tes propres tests (au moins 6).

## Contrat exact (des tests cachés l'utilisent)

```ts
import type { DisponibiliteRoutine, Lecon, OuverturePonctuelle, PreferencesEleve } from '@/data/types';

export type CreneauAlerte = {
  eleveId: string;
  /** 'YYYY-MM-DD' : la date de l'ouverture */
  date: string;
  /** 'HH:MM' : début de la fenêtre proposée à l'élève */
  debut: string;
  /** 'HH:MM' : fin de la fenêtre proposée à l'élève */
  fin: string;
};

export function elevesANotifier(params: {
  moniteurId: string;
  ouverture: OuverturePonctuelle;
  routine: DisponibiliteRoutine[];
  preferences: PreferencesEleve[];
  lecons: Lecon[];
  maintenant: Date;
  /** Durée minimale d'une fenêtre, en minutes. Par défaut 60. */
  dureeMinimale?: number;
}): CreneauAlerte[];
```

## Règles

Toutes les dates/heures sont en **heure locale** du téléphone. `jour` suit la norme ISO : 1 = lundi … 7 = dimanche.

1. **Partie inhabituelle** : la plage de l'ouverture MOINS toutes les plages de la routine du même jour de la semaine que `ouverture.date`. Elle peut être découpée en plusieurs morceaux. Si elle est vide → `[]`.
2. **Passé** : on retire de la partie inhabituelle tout ce qui est avant `maintenant` (à la minute près, en tronquant les secondes). Une ouverture entièrement passée → `[]`.
3. **Élèves concernés** : seulement ceux dont `moniteursFavorisIds` contient `moniteurId`.
4. **Fenêtre** : pour chaque créneau préféré de l'élève du même jour de la semaine, on calcule son intersection avec chaque morceau de la partie inhabituelle. Une intersection est retenue si sa durée est **≥ `dureeMinimale`** minutes.
5. **Déjà occupé** : on écarte une fenêtre si l'élève a une leçon (`lecons`, quel que soit l'enseignant) qui la chevauche ce jour-là (se toucher n'est pas chevaucher).
6. **Une seule alerte par élève** : s'il reste plusieurs fenêtres, on garde la plus tôt.
7. **Tri** : par `debut` croissant, puis par `eleveId` (ordre alphabétique).

## Exemple

Routine du samedi : aucune. Ouverture samedi 21/11 de 09:00 à 12:00. Lina (favori, préfère le samedi 09:00-12:00) → `{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '12:00' }`. Sarah (favori, préfère le samedi 08:00-09:30) → intersection 09:00-09:30 = 30 min < 60 → pas d'alerte.

## Fini quand

- `pnpm check` passe (y compris les tests existants) ;
- fonction pure : pas d'accès à `@/data/depot`, pas de `new Date()` sans argument (utiliser `maintenant`) ;
- seuls les fichiers ci-dessus sont créés.
