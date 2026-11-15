import { calculerProgression, coursAReproposer, sousCompetencesARevoir } from './progression';
import type { Appreciation, FicheLecon, SousCompetence } from './types';

const catalogue: SousCompetence[] = [
  { id: 'c1-a', competence: 'C1', libelle: 'a' },
  { id: 'c1-b', competence: 'C1', libelle: 'b' },
  { id: 'c2-a', competence: 'C2', libelle: 'a' },
  { id: 'c2-d', competence: 'C2', libelle: 'd' },
  { id: 'c3-e', competence: 'C3', libelle: 'e' },
];

let numero = 0;
function fiche(date: string, evaluations: [string, Appreciation][]): FicheLecon {
  numero += 1;
  return {
    leconId: `l${numero}`,
    numeroLecon: numero,
    eleveId: 'e1',
    enseignantId: 'm1',
    date,
    sousCompetences: evaluations.map(([id, appreciation]) => ({
      sousCompetenceId: id,
      competence: catalogue.find((s) => s.id === id)?.competence ?? 'C1',
      appreciation,
    })),
    observationPartagee: '',
    observationInterne: '',
    aSignaler: false,
    valideeLe: date,
    corrections: [],
  };
}

const compte = (progression: { code: string; acquises: number }[]) =>
  Object.fromEntries(progression.map((p) => [p.code, p.acquises]));

describe('progression calculée à partir des fiches', () => {
  it('part du livret existant et ajoute les sous-compétences acquises', () => {
    const p = calculerProgression(catalogue, ['c1-a'], [fiche('2026-11-01', [['c2-a', 'acquis']])]);
    expect(compte(p)).toEqual({ C1: 1, C2: 1, C3: 0, C4: 0 });
    expect(p.map((c) => c.total)).toEqual([2, 2, 1, 0]);
  });

  it('« vu » ne change pas la progression', () => {
    const p = calculerProgression(catalogue, ['c1-a'], [fiche('2026-11-01', [['c1-a', 'vu'], ['c2-a', 'vu']])]);
    expect(compte(p)).toEqual({ C1: 1, C2: 0, C3: 0, C4: 0 });
  });

  it('« non maîtrisé » retire une sous-compétence acquise auparavant', () => {
    const p = calculerProgression(catalogue, ['c2-d'], [fiche('2026-11-01', [['c2-d', 'non-maitrise']])]);
    expect(compte(p).C2).toBe(0);
  });

  it('la fiche la plus récente l’emporte, quel que soit l’ordre reçu', () => {
    const recente = fiche('2026-11-08', [['c3-e', 'acquis']]);
    const ancienne = fiche('2026-11-01', [['c3-e', 'non-maitrise']]);
    expect(compte(calculerProgression(catalogue, [], [recente, ancienne])).C3).toBe(1);
    expect(sousCompetencesARevoir([recente, ancienne])).toEqual([]);
  });
});

describe('cours reproposé après « non maîtrisé »', () => {
  const coursPriorites = { id: 'priorites', sousCompetencesIds: ['c2-d', 'c2-a'] };
  const coursInsertion = { id: 'insertion', sousCompetencesIds: ['c3-e'] };

  it('repropose le cours qui travaille la sous-compétence non maîtrisée, avec le motif', () => {
    const fiches = [fiche('2026-11-08', [['c2-d', 'non-maitrise'], ['c3-e', 'acquis']])];
    const propositions = coursAReproposer([coursPriorites, coursInsertion], fiches);
    expect(propositions.map((p) => p.cours.id)).toEqual(['priorites']);
    expect(propositions[0].motif).toMatchObject({ sousCompetenceId: 'c2-d', date: '2026-11-08' });
  });

  it('ne repropose pas le cours déjà prévu pour la prochaine leçon', () => {
    const fiches = [fiche('2026-11-08', [['c3-e', 'non-maitrise']])];
    expect(coursAReproposer([coursPriorites, coursInsertion], fiches, 'insertion')).toEqual([]);
  });

  it('ne repropose plus rien quand la sous-compétence est acquise ensuite', () => {
    const fiches = [fiche('2026-11-01', [['c2-d', 'non-maitrise']]), fiche('2026-11-08', [['c2-d', 'acquis']])];
    expect(coursAReproposer([coursPriorites], fiches)).toEqual([]);
  });
});
