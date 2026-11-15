/**
 * Progression du livret calculée à partir des fiches de leçon (docs/fiche-de-lecon.md) :
 * - « Acquis » fait compter la sous-compétence dans la progression C1 à C4 ;
 * - « Non maîtrisé » la retire (même si elle était acquise avant) et fait reproposer le cours correspondant ;
 * - « Vu » ne change rien : la sous-compétence a été abordée, pas évaluée.
 * C'est la fiche la plus récente qui compte.
 */
import type { CodeCompetence, FicheLecon, SousCompetence } from './types';

const CODES: CodeCompetence[] = ['C1', 'C2', 'C3', 'C4'];

export type EtatEvalue = {
  appreciation: 'acquis' | 'non-maitrise';
  date: string;
  numeroLecon: number;
};

/** Dernière appréciation décisive (acquis / non maîtrisé) de chaque sous-compétence. */
export function dernieresAppreciations(fiches: FicheLecon[]): Map<string, EtatEvalue> {
  const etats = new Map<string, EtatEvalue>();
  for (const fiche of [...fiches].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const s of fiche.sousCompetences) {
      if (s.appreciation === 'vu') continue;
      etats.set(s.sousCompetenceId, { appreciation: s.appreciation, date: fiche.date, numeroLecon: fiche.numeroLecon });
    }
  }
  return etats;
}

/**
 * Nombre de sous-compétences acquises par compétence.
 * `acquisesAvant` : acquises avant les fiches Créno (livret repris de l'ancien logiciel).
 */
export function calculerProgression(
  catalogue: SousCompetence[],
  acquisesAvant: string[],
  fiches: FicheLecon[],
): { code: CodeCompetence; acquises: number; total: number }[] {
  const etats = dernieresAppreciations(fiches);
  const avant = new Set(acquisesAvant);
  const estAcquise = (id: string) => {
    const etat = etats.get(id);
    return etat ? etat.appreciation === 'acquis' : avant.has(id);
  };
  return CODES.map((code) => {
    const sousCompetences = catalogue.filter((s) => s.competence === code);
    return { code, acquises: sousCompetences.filter((s) => estAcquise(s.id)).length, total: sousCompetences.length };
  });
}

/** Sous-compétences dont la dernière appréciation est « non maîtrisé ». */
export function sousCompetencesARevoir(fiches: FicheLecon[]): ({ sousCompetenceId: string } & EtatEvalue)[] {
  return [...dernieresAppreciations(fiches)]
    .filter(([, etat]) => etat.appreciation === 'non-maitrise')
    .map(([sousCompetenceId, etat]) => ({ sousCompetenceId, ...etat }));
}

/**
 * Cours à reproposer : ceux qui travaillent une sous-compétence non maîtrisée.
 * `exclureCoursId` : le cours déjà prévu pour la prochaine leçon (inutile de le proposer deux fois).
 */
export function coursAReproposer<C extends { id: string; sousCompetencesIds?: string[] }>(
  catalogue: C[],
  fiches: FicheLecon[],
  exclureCoursId?: string,
): { cours: C; motif: { sousCompetenceId: string } & EtatEvalue }[] {
  const aRevoir = sousCompetencesARevoir(fiches);
  return catalogue.flatMap((cours) => {
    if (cours.id === exclureCoursId) return [];
    const motif = aRevoir.find((r) => cours.sousCompetencesIds?.includes(r.sousCompetenceId));
    return motif ? [{ cours, motif }] : [];
  });
}
