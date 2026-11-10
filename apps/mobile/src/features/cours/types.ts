/** Modèle du cours avant la leçon — voir docs/cours-avant-lecon.md. */

export type VideoCours = {
  titre: string;
  /** Source lisible par expo-video : `require(...)` en démo, URL HLS signée en production. */
  source: number | string;
  dureeSecondes: number;
};

export type FicheTechnique = {
  titre: string;
  etapes: { titre: string; texte: string }[];
};

export type QuestionQuiz = {
  id: string;
  enonce: string;
  /** Réponses dans l'ordre de saisie ; l'ordre affiché est mélangé à chaque passage. */
  reponses: { texte: string; correcte: boolean }[];
  explication: string;
};

export type Cours = {
  id: string;
  titre: string;
  competence: 'C1' | 'C2' | 'C3' | 'C4';
  videos: VideoCours[];
  fiches: FicheTechnique[];
  banqueQuestions: QuestionQuiz[];
  nbQuestionsAffichees: number;
  seuilReussite: number;
  loi?: { texte: string; misAJourLe?: string };
  /** Contenu de démonstration (à remplacer par celui de l'auto-école). */
  demonstration?: boolean;
};

/** Une question telle que présentée à l'élève : réponses mélangées. */
export type QuestionTiree = {
  id: string;
  enonce: string;
  reponses: { texte: string; correcte: boolean }[];
  explication: string;
};

export type ResultatQuiz = {
  score: number;
  total: number;
  valide: boolean;
  /** Questions ratées, avec la bonne réponse et l'explication (pour le bilan). */
  ratees: { question: QuestionTiree; reponseDonnee: string | null; bonneReponse: string }[];
};

export type StatutCours = 'non-commence' | 'commence' | 'valide';

export type Tentative = {
  date: string;
  score: number;
  total: number;
  questionsRateesIds: string[];
};

export type SuiviCours = {
  eleveId: string;
  coursId: string;
  statut: StatutCours;
  tentatives: Tentative[];
};
