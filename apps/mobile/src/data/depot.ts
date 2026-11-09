/**
 * Accès aux données. Pour l'instant : données fictives en mémoire.
 * Plus tard : Supabase. Les écrans n'importent QUE ce fichier, jamais `mock.ts`.
 */
import { construireLecons, disponibilites, eleves, moniteurConnecteId, moniteurs, observations, preferences } from './mock';
import type { DisponibilitesMoniteur, Eleve, Lecon, Moniteur, Observation, PreferencesEleve } from './types';

export function listerEleves(): Eleve[] {
  return eleves;
}

export function trouverEleve(id: string): Eleve | undefined {
  return eleves.find((e) => e.id === id);
}

export function trouverMoniteur(id: string): Moniteur | undefined {
  return moniteurs.find((m) => m.id === id);
}

export function idMoniteurConnecte(): string {
  return moniteurConnecteId;
}

export function leconsDeLEleve(eleveId: string, maintenant = new Date()): Lecon[] {
  return construireLecons(maintenant)
    .filter((l) => l.eleveId === eleveId)
    .sort((a, b) => a.debut.localeCompare(b.debut));
}

/** Prochaine leçon non terminée de l'élève, ou undefined. */
export function prochaineLecon(eleveId: string, maintenant = new Date()): Lecon | undefined {
  return leconsDeLEleve(eleveId, maintenant).find((l) => new Date(l.fin) > maintenant);
}

/** Nombre de leçons déjà effectuées (numéro de la prochaine leçon − 1 si elle existe). */
export function leconsEffectuees(eleveId: string, maintenant = new Date()): number {
  const prochaine = prochaineLecon(eleveId, maintenant);
  return prochaine ? prochaine.numero - 1 : 0;
}

export function leconsDuMoniteur(moniteurId: string, maintenant = new Date()): Lecon[] {
  return construireLecons(maintenant)
    .filter((l) => l.moniteurId === moniteurId)
    .sort((a, b) => a.debut.localeCompare(b.debut));
}

export function observationsDeLEleve(eleveId: string): Observation[] {
  return observations.filter((o) => o.eleveId === eleveId).sort((a, b) => b.date.localeCompare(a.date));
}

export function disponibilitesDuMoniteur(moniteurId: string): DisponibilitesMoniteur {
  return (
    disponibilites.find((d) => d.moniteurId === moniteurId) ?? { moniteurId, routine: [], ouvertures: [], absences: [] }
  );
}

export function listerPreferences(): PreferencesEleve[] {
  return preferences;
}
