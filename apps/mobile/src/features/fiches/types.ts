/** Modèle de la fiche de leçon — voir docs/fiche-de-lecon.md. */

export type CodeCompetence = 'C1' | 'C2' | 'C3' | 'C4';

export type Appreciation = 'vu' | 'acquis' | 'non-maitrise';

export const libellesAppreciation: Record<Appreciation, string> = {
  vu: 'Vu',
  acquis: 'Acquis',
  'non-maitrise': 'Non maîtrisé',
};

/** Sous-compétence du livret d'apprentissage (référentiel REMC). */
export type SousCompetence = {
  id: string;
  competence: CodeCompetence;
  libelle: string;
};

export type EvaluationSousCompetence = {
  sousCompetenceId: string;
  competence: CodeCompetence;
  appreciation: Appreciation;
};

/** Champs de la fiche que la direction peut corriger. */
export type ChampCorrigeable = 'observationPartagee' | 'observationInterne' | 'aSignaler';

export type Correction = {
  /** Identifiant de la personne de la direction qui a corrigé. */
  par: string;
  le: string;
  champ: ChampCorrigeable;
  avant: string;
  apres: string;
};

export type FicheLecon = {
  leconId: string;
  numeroLecon: number;
  eleveId: string;
  enseignantId: string;
  /** Date de la leçon. */
  date: string;
  sousCompetences: EvaluationSousCompetence[];
  /** Visible par l'élève, les enseignants et la direction. */
  observationPartagee: string;
  /** Enseignants et direction UNIQUEMENT. En production, jamais envoyée à un compte élève (règle côté serveur). */
  observationInterne: string;
  /** Affiche l'observation interne en alerte pour l'équipe. */
  aSignaler: boolean;
  /** Après validation, l'enseignant ne peut plus modifier la fiche. */
  valideeLe: string;
  /** Corrections faites par la direction, dans l'ordre. L'original reste reconstituable. */
  corrections: Correction[];
};

/** Ce que l'élève (ou son représentant légal) reçoit : sans observation interne ni signalement. */
export type FicheVueEleve = Omit<FicheLecon, 'observationInterne' | 'aSignaler' | 'corrections'>;

/** Ce que l'enseignant saisit avant de valider. */
export type BrouillonFiche = Pick<FicheLecon, 'sousCompetences' | 'observationPartagee' | 'observationInterne' | 'aSignaler'>;

export type ErreurFiche = {
  champ: 'sousCompetences' | 'observationPartagee' | 'observationInterne';
  message: string;
};

export type RoleEquipe = 'enseignant' | 'direction';
