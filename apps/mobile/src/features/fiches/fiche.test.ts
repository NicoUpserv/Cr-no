import {
  corrigerFiche,
  dernierSignalement,
  resumerAppreciations,
  validerFiche,
  verifierBrouillon,
  versionEleve,
} from './fiche';
import type { BrouillonFiche, FicheLecon } from './types';

const lecon = { leconId: 'l1', numeroLecon: 13, eleveId: 'e1', enseignantId: 'm1', date: '2026-11-08T14:00:00.000Z' };
const maintenant = new Date('2026-11-08T15:05:00.000Z');

const brouillon: BrouillonFiche = {
  sousCompetences: [
    { sousCompetenceId: 'c3-voie-rapide', competence: 'C3', appreciation: 'non-maitrise' },
    { sousCompetenceId: 'c2-allure', competence: 'C2', appreciation: 'acquis' },
    { sousCompetenceId: 'c2-giratoires', competence: 'C2', appreciation: 'acquis' },
  ],
  observationPartagee: '  Bonne gestion des giratoires.  ',
  observationInterne: 'A freiné tardivement deux fois avant un passage piéton.',
  aSignaler: true,
};

describe('fiche de leçon : saisie', () => {
  it('accepte une fiche complète et nettoie les espaces', () => {
    expect(verifierBrouillon(brouillon)).toEqual([]);
    const fiche = validerFiche(brouillon, lecon, maintenant);
    expect(fiche.observationPartagee).toBe('Bonne gestion des giratoires.');
    expect(fiche.valideeLe).toBe(maintenant.toISOString());
    expect(fiche.corrections).toEqual([]);
  });

  it('exige au moins une sous-compétence', () => {
    const erreurs = verifierBrouillon({ ...brouillon, sousCompetences: [] });
    expect(erreurs.map((e) => e.champ)).toEqual(['sousCompetences']);
  });

  it('refuse un signalement sans explication', () => {
    const erreurs = verifierBrouillon({ ...brouillon, observationInterne: '   ' });
    expect(erreurs.map((e) => e.champ)).toEqual(['observationInterne']);
    expect(() => validerFiche({ ...brouillon, observationInterne: '' }, lecon, maintenant)).toThrow();
  });

  it('accepte une observation interne vide sans signalement', () => {
    expect(verifierBrouillon({ ...brouillon, observationInterne: '', aSignaler: false })).toEqual([]);
  });

  it('limite la longueur des observations', () => {
    const erreurs = verifierBrouillon({ ...brouillon, observationPartagee: 'x'.repeat(1001) });
    expect(erreurs.map((e) => e.champ)).toEqual(['observationPartagee']);
  });
});

describe('fiche de leçon : après validation', () => {
  const fiche: FicheLecon = validerFiche(brouillon, lecon, maintenant);
  const plusTard = new Date('2026-11-09T09:00:00.000Z');

  it('refuse la correction par un enseignant, même l’auteur', () => {
    expect(() =>
      corrigerFiche(fiche, { observationPartagee: 'Autre' }, { id: 'm1', role: 'enseignant' }, plusTard),
    ).toThrow('direction');
  });

  it('historise chaque correction de la direction, avec la valeur d’origine', () => {
    const corrigee = corrigerFiche(
      fiche,
      { observationInterne: 'A freiné tardivement une fois.', aSignaler: false },
      { id: 'd1', role: 'direction' },
      plusTard,
    );
    expect(corrigee.observationInterne).toBe('A freiné tardivement une fois.');
    expect(corrigee.aSignaler).toBe(false);
    expect(corrigee.corrections).toEqual([
      { par: 'd1', le: plusTard.toISOString(), champ: 'observationInterne', avant: fiche.observationInterne, apres: 'A freiné tardivement une fois.' },
      { par: 'd1', le: plusTard.toISOString(), champ: 'aSignaler', avant: 'true', apres: 'false' },
    ]);
  });

  it('n’ajoute rien à l’historique si rien ne change', () => {
    const memes = corrigerFiche(fiche, { aSignaler: true }, { id: 'd1', role: 'direction' }, plusTard);
    expect(memes).toBe(fiche);
  });

  it('ne transmet jamais l’observation interne ni le signalement à l’élève', () => {
    const vue = versionEleve(fiche);
    expect(vue).not.toHaveProperty('observationInterne');
    expect(vue).not.toHaveProperty('aSignaler');
    expect(vue).not.toHaveProperty('corrections');
    expect(JSON.stringify(vue)).not.toContain('freiné tardivement');
    expect(vue.observationPartagee).toBe('Bonne gestion des giratoires.');
  });

  it('trouve le signalement le plus récent', () => {
    const ancienne = { ...fiche, leconId: 'l0', date: '2026-11-01T14:00:00.000Z' };
    const sansSignalement = { ...fiche, leconId: 'l2', date: '2026-11-10T14:00:00.000Z', aSignaler: false };
    expect(dernierSignalement([ancienne, fiche, sansSignalement])?.leconId).toBe('l1');
    expect(dernierSignalement([sansSignalement])).toBeUndefined();
  });

  it('résume les appréciations', () => {
    expect(resumerAppreciations(fiche)).toBe('2 acquises · 1 non maîtrisée');
    expect(resumerAppreciations({ sousCompetences: [] })).toBe('Aucune sous-compétence évaluée');
  });
});
