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

/** Véhicule utilisé pendant la leçon (code couleur du planning). */
export type TypeVehicule = 'manuelle' | 'automatique' | 'moto' | 'remorque';

export const libellesVehicule: Record<TypeVehicule, string> = {
  manuelle: 'Boîte manuelle',
  automatique: 'Boîte automatique',
  moto: 'Moto',
  remorque: 'Remorque (BE)',
};

export type CodeCompetence = 'C1' | 'C2' | 'C3' | 'C4';

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
  /** Adresse du domicile (dépôt possible en fin de leçon, à la demande de l'élève). */
  adresse: string;
  permis: TypePermis;
  /** Nombre de leçons prévues au forfait. */
  forfaitLecons: number;
  /**
   * Sous-compétences du livret acquises AVANT les fiches de leçon Créno (livret repris de l'ancien logiciel).
   * La progression affichée y ajoute les appréciations des fiches (features/fiches/progression).
   */
  sousCompetencesAcquisesIds: string[];
  piecesManquantes: string[];
  moniteursFavorisIds: string[];
  /** Date d'inscription « YYYY-MM-DD » (point de départ des relances du dossier). */
  inscritLe: string;
};

/** Cours à consulter par l'élève avant une leçon de conduite. */
export type CoursPrealable = {
  /** Identifiant du cours du catalogue (voir features/cours). */
  coursId: string;
  envoyeLe: string;
};

export type Lecon = {
  id: string;
  /** Rang de la leçon dans le parcours de l'élève (L14). */
  numero: number;
  eleveId: string;
  moniteurId: string;
  debut: string;
  fin: string;
  /** Lieu de prise en charge. */
  lieuDepart: Lieu;
  /** Lieu de dépôt : le même que la prise en charge sauf demande de l'élève. */
  lieuFin: Lieu;
  /** Consigne pour l'enseignant (« Élève à récupérer devant la gare »). */
  observation?: string;
  cours?: CoursPrealable;
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

export const libellesMotifAbsence: Record<MotifAbsence, string> = {
  repos: 'Repos',
  conges: 'Congés',
  maladie: 'Maladie',
  autre: 'Autre',
};

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

/** Message entre un élève et son auto-école (la direction). Les enseignants n'y ont pas accès. */
export type Message = {
  id: string;
  eleveId: string;
  de: 'eleve' | 'auto-ecole';
  texte: string;
  envoyeLe: string;
  /** Relance du dossier (automatique ou envoyée par la direction). */
  relance?: 'automatique' | 'manuelle';
};

export type ExamenBlanc = {
  id: string;
  eleveId: string;
  /** Enseignant qui a fait passer l'examen blanc (jamais eu par l'élève). */
  evaluateurId: string;
  date: string;
  reussi: boolean;
};
