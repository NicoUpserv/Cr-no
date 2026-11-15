/**
 * Accès aux données. Pour l'instant : données fictives en mémoire.
 * Plus tard : Supabase. Les écrans n'importent QUE ce fichier, jamais `mock.ts`.
 */
import type { Cours } from '@/features/cours/types';
import type { CodeCompetence, FicheLecon, SousCompetence } from '@/features/fiches/types';

import { coursInsertionDemo, coursPrioritesDemo } from './cours-demo';
import { libellesCompetences, sousCompetencesB } from './remc';
import {
  autoEcole,
  construireLecons,
  demandesAbsence,
  disponibilites,
  documentsRecus,
  eleveConnecteId,
  eleves,
  examensBlancs,
  meteoDemo,
  moniteurConnecteId,
  moniteurs,
  fichesDemo,
  preferences,
} from './mock';
import type {
  AutoEcole,
  DemandeAbsence,
  DisponibilitesMoniteur,
  DocumentRecu,
  Eleve,
  ExamenBlanc,
  Lecon,
  Meteo,
  Moniteur,
  PreferencesEleve,
} from './types';

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

export function trouverLecon(id: string, maintenant = new Date()): Lecon | undefined {
  return construireLecons(maintenant).find((l) => l.id === id);
}

/** Leçons de l'enseignant terminées aujourd'hui (leur fiche est à remplir si elle n'existe pas). */
export function leconsTermineesDuJour(moniteurId: string, maintenant = new Date()): Lecon[] {
  return leconsDuMoniteur(moniteurId, maintenant).filter(
    (l) => new Date(l.fin) <= maintenant && new Date(l.debut).toDateString() === maintenant.toDateString(),
  );
}

/* ----- Fiches de leçon et livret ----- */

/** Fiches déjà validées au démarrage de la démo (ensuite gérées par `lib/fiches-lecon`). */
export function fichesInitiales(): FicheLecon[] {
  return fichesDemo;
}

export function listerSousCompetences(): SousCompetence[] {
  return sousCompetencesB;
}

export function trouverSousCompetence(id: string): SousCompetence | undefined {
  return sousCompetencesB.find((s) => s.id === id);
}

/** Personne de la direction connectée (démo). */
export function idDirectionConnectee(): string {
  return 'd-direction';
}

export function disponibilitesDuMoniteur(moniteurId: string): DisponibilitesMoniteur {
  return (
    disponibilites.find((d) => d.moniteurId === moniteurId) ?? { moniteurId, routine: [], ouvertures: [], absences: [] }
  );
}

export function listerPreferences(): PreferencesEleve[] {
  return preferences;
}

/* ----- Démonstration : élève connecté, auto-école, direction ----- */

export function infosAutoEcole(): AutoEcole {
  return autoEcole;
}

export function idEleveConnecte(): string {
  return eleveConnecteId;
}

/** Météo prévue pour une leçon (fictive tant qu'aucun service météo n'est branché). */
export function meteoPourLecon(_lecon: Lecon): Meteo {
  return meteoDemo;
}

export function listerMoniteurs(): Moniteur[] {
  return moniteurs;
}

/** Toutes les leçons du jour, tous enseignants confondus. */
export function leconsDuJour(maintenant = new Date()): Lecon[] {
  const memeJour = (iso: string) => new Date(iso).toDateString() === maintenant.toDateString();
  return construireLecons(maintenant)
    .filter((l) => memeJour(l.debut))
    .sort((a, b) => a.debut.localeCompare(b.debut));
}

export function demandesAbsenceEnAttente(): DemandeAbsence[] {
  return demandesAbsence.filter((d) => d.statut === 'en-attente');
}

export function documentsAValider(): DocumentRecu[] {
  return documentsRecus;
}

/** Élèves dont le dernier examen blanc est réussi : à placer sur une date d'examen. */
export function elevesPretsPourLExamen(): { eleve: Eleve; examen: ExamenBlanc }[] {
  return examensBlancs
    .filter((e) => e.reussi)
    .flatMap((examen) => {
      const eleve = trouverEleve(examen.eleveId);
      return eleve ? [{ eleve, examen }] : [];
    });
}

/* ----- Cours avant la leçon ----- */

const catalogueCours: Cours[] = [coursInsertionDemo, coursPrioritesDemo];

export function listerCours(): Cours[] {
  return catalogueCours;
}

export function trouverCours(coursId: string | undefined): Cours | undefined {
  return coursId ? catalogueCours.find((c) => c.id === coursId) : undefined;
}

export function libelleCompetence(code: CodeCompetence): string {
  return libellesCompetences[code];
}
