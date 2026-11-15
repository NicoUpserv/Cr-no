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
  lieuxAutoEcole,
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
  Lieu,
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

/**
 * Leçons enregistrées au démarrage de la démo. Les écrans ne l'appellent pas directement :
 * ils passent par `lib/planning` (`usePlanning`), qui y ajoute les réservations et retire les annulations.
 */
export function leconsEnregistrees(maintenant = new Date()): Lecon[] {
  return construireLecons(maintenant);
}

/** Lieux de rendez-vous proposés par l'auto-école. */
export function lieuxDeRendezVous(): Lieu[] {
  return lieuxAutoEcole;
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

/** Disponibilités au démarrage de la démo (ensuite modifiables via `lib/planning`). */
export function disponibilitesInitiales(): DisponibilitesMoniteur[] {
  return disponibilites;
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
