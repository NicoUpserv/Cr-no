/**
 * Modèle de données de Créno (première version, données fictives en local).
 * Les dates sont des chaînes ISO 8601 ; les heures de créneau sont « HH:MM ».
 */

export type TypePermis = 'B' | 'B-AAC' | 'B-CS' | 'B-auto' | 'AM' | 'A1' | 'A2' | 'BE';

export const libellesPermis: Record<TypePermis, string> = {
  B: 'Permis B',
  'B-AAC': 'Permis B · conduite accompagnée',
  'B-CS': 'Permis B · conduite supervisée',
  'B-auto': 'Permis B · boîte automatique',
  AM: 'Permis AM',
  A1: 'Permis A1',
  A2: 'Permis A2',
  BE: 'Permis BE',
};

export type CodeCompetence = 'C1' | 'C2' | 'C3' | 'C4';

export type Competence = {
  code: CodeCompetence;
  libelle: string;
  sousCompetencesTotal: number;
  sousCompetencesAcquises: number;
};

export type Lieu = {
  nom: string;
  adresse: string;
};

export type Moniteur = {
  id: string;
  prenom: string;
  nom: string;
};

export type Eleve = {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  permis: TypePermis;
  /** Nombre de leçons prévues au forfait. */
  forfaitLecons: number;
  competences: Competence[];
  piecesManquantes: string[];
  moniteursFavorisIds: string[];
};

/** Cours à consulter par l'élève avant une leçon de conduite. */
export type CoursPrealable = {
  titre: string;
  envoyeLe: string;
  /** Nombre de fois où l'élève l'a ouvert. 0 = non consulté. */
  ouvertures: number;
};

export type Lecon = {
  id: string;
  /** Rang de la leçon dans le parcours de l'élève (L14). */
  numero: number;
  eleveId: string;
  moniteurId: string;
  debut: string;
  fin: string;
  lieuDepart: Lieu;
  lieuFin: Lieu;
  cours?: CoursPrealable;
};

export type Observation = {
  id: string;
  eleveId: string;
  auteurId: string;
  date: string;
  texte: string;
  /** false = note réservée aux enseignants. */
  visibleParEleve: boolean;
};

/* ----- Disponibilités et préférences (utilisées par les tâches suivantes) ----- */

/** 1 = lundi … 7 = dimanche (ISO 8601). */
export type JourSemaine = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Plage horaire « HH:MM » → « HH:MM », fin strictement après le début. */
export type Plage = {
  debut: string;
  fin: string;
};

/** Disponibilité habituelle d'un enseignant, répétée chaque semaine. */
export type DisponibiliteRoutine = Plage & {
  jour: JourSemaine;
};

/** Disponibilité exceptionnelle à une date précise (« YYYY-MM-DD »). */
export type OuverturePonctuelle = Plage & {
  id: string;
  date: string;
};

export type MotifAbsence = 'repos' | 'conges' | 'maladie' | 'autre';

/** Absence sur une période de dates incluses (« YYYY-MM-DD »). */
export type Absence = {
  id: string;
  du: string;
  au: string;
  motif: MotifAbsence;
};

export type DisponibilitesMoniteur = {
  moniteurId: string;
  routine: DisponibiliteRoutine[];
  ouvertures: OuverturePonctuelle[];
  absences: Absence[];
};

/** Préférences horaires d'un élève, par jour de la semaine. */
export type PreferencesEleve = {
  eleveId: string;
  creneaux: DisponibiliteRoutine[];
  moniteursFavorisIds: string[];
};

/* ----- Auto-école, direction et démonstration ----- */

export type AutoEcole = {
  nom: string;
  ville: string;
  /** Offre mise en avant auprès des élèves (promotion, parrainage…). */
  offre?: { titre: string; texte: string };
};

/** Météo prévue au lieu et à l'heure d'une leçon. */
export type Meteo = {
  temperature: number;
  ciel: string;
};

export type DemandeAbsence = {
  id: string;
  moniteurId: string;
  du: string;
  au: string;
  motif: MotifAbsence;
  justificatifJoint: boolean;
  statut: 'en-attente' | 'acceptee' | 'refusee';
};

export type DocumentRecu = {
  id: string;
  eleveId: string;
  titre: string;
  recuLe: string;
};

export type ExamenBlanc = {
  id: string;
  eleveId: string;
  /** Enseignant qui a fait passer l'examen blanc (jamais eu par l'élève). */
  evaluateurId: string;
  date: string;
  reussi: boolean;
};
