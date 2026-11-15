/** Requêtes sur une liste de leçons (fonctions pures, utilisées par l'état du planning). */
import type { Lecon } from '@/data/types';

import { dateLocale } from './creneaux';

const parDate = (a: Lecon, b: Lecon) => a.debut.localeCompare(b.debut);

export function leconsDeLEleve(lecons: Lecon[], eleveId: string): Lecon[] {
  return lecons.filter((l) => l.eleveId === eleveId).sort(parDate);
}

export function leconsDuMoniteur(lecons: Lecon[], moniteurId: string): Lecon[] {
  return lecons.filter((l) => l.moniteurId === moniteurId).sort(parDate);
}

/** Prochaine leçon non terminée de l'élève. */
export function prochaineLecon(lecons: Lecon[], eleveId: string, maintenant: Date): Lecon | undefined {
  return leconsDeLEleve(lecons, eleveId).find((l) => new Date(l.fin) > maintenant);
}

/** Nombre de leçons déjà faites (numéro de la prochaine − 1, sinon numéro de la dernière). */
export function leconsEffectuees(lecons: Lecon[], eleveId: string, maintenant: Date): number {
  const siennes = leconsDeLEleve(lecons, eleveId);
  const prochaine = siennes.find((l) => new Date(l.fin) > maintenant);
  if (prochaine) return prochaine.numero - 1;
  return siennes.length > 0 ? siennes[siennes.length - 1].numero : 0;
}

/** Leçons d'une date « YYYY-MM-DD » (heure locale). */
export function leconsDuJour(lecons: Lecon[], date: string): Lecon[] {
  return lecons.filter((l) => dateLocale(l.debut) === date).sort(parDate);
}

/** Leçons de l'enseignant terminées aujourd'hui (leur fiche est à remplir si elle n'existe pas). */
export function leconsTermineesDuJour(lecons: Lecon[], moniteurId: string, maintenant: Date): Lecon[] {
  return leconsDuJour(leconsDuMoniteur(lecons, moniteurId), dateLocale(maintenant)).filter(
    (l) => new Date(l.fin) <= maintenant,
  );
}
