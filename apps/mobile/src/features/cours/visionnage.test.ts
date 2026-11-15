import type { Cours } from './types';
import {
  avancerVisionnage,
  pourcentageVu,
  positionAutorisee,
  progressionVide,
  resteAvantQuiz,
  visionnageVide,
  type Visionnage,
} from './visionnage';

const cours: Cours = {
  id: 'c',
  titre: 'Cours',
  competence: 'C3',
  videos: [
    { titre: 'V1', source: 'v1', dureeSecondes: 10 },
    { titre: 'V2', source: 'v2', dureeSecondes: 10 },
    { titre: 'V3', source: 'v3', dureeSecondes: 10 },
  ],
  fiches: [
    { titre: 'F1', etapes: [] },
    { titre: 'F2', etapes: [] },
  ],
  banqueQuestions: [],
  nbQuestionsAffichees: 6,
  seuilReussite: 5,
};

/** Simule une lecture continue de `de` à `a` secondes, par pas de 0,5 s. */
function lire(v: Visionnage, de: number, a: number, duree = 10): Visionnage {
  let etat = v;
  for (let t = de; t < a; t += 0.5) etat = avancerVisionnage(etat, t, t + 0.5, duree);
  return etat;
}

describe('verrou du quiz : visionnage des vidéos', () => {
  it('compte la lecture continue et termine la vidéo à 95 %', () => {
    const v = lire(visionnageVide, 0, 9.5);
    expect(v.secondesVues).toBeCloseTo(9.5);
    expect(v.terminee).toBe(true);
  });

  it('ne termine pas une vidéo regardée à 90 %', () => {
    expect(lire(visionnageVide, 0, 9).terminee).toBe(false);
  });

  it('ne compte pas un saut en avant', () => {
    const v = avancerVisionnage(lire(visionnageVide, 0, 2), 2, 9.8, 10);
    expect(v.secondesVues).toBeCloseTo(2);
    expect(v.terminee).toBe(false);
  });

  it('ne compte pas un retour en arrière, ni deux fois le même passage au-delà de la durée', () => {
    let v = lire(visionnageVide, 0, 5);
    v = avancerVisionnage(v, 5, 1, 10);
    expect(v.secondesVues).toBeCloseTo(5);
    v = lire(v, 0, 10);
    expect(v.secondesVues).toBe(10);
  });

  it('ramène la lecture au point atteint en cas d’avance rapide au premier visionnage', () => {
    const v = lire(visionnageVide, 0, 3);
    expect(positionAutorisee(v, 8)).toBe(3);
    expect(positionAutorisee(v, 4)).toBeNull();
  });

  it('autorise l’avance rapide une fois la vidéo vue en entier', () => {
    const v = lire(visionnageVide, 0, 10);
    expect(positionAutorisee(v, 9)).toBeNull();
  });

  it('affiche un pourcentage qui n’atteint 100 que si la vidéo est vue', () => {
    expect(pourcentageVu(lire(visionnageVide, 0, 5), 10)).toBe(50);
    expect(pourcentageVu({ secondesVues: 9.4, positionMax: 9.4, terminee: false }, 10)).toBe(94);
    expect(pourcentageVu(lire(visionnageVide, 0, 10), 10)).toBe(100);
  });
});

describe('verrou du quiz : ce qu’il reste à faire', () => {
  it('liste les vidéos non vues et les fiches au départ', () => {
    expect(resteAvantQuiz(cours, progressionVide(cours))).toEqual([
      'regarder les vidéos 1, 2 et 3 en entier',
      'lire les fiches jusqu’en bas',
    ]);
  });

  it('ne cite que la vidéo manquante', () => {
    const vue = lire(visionnageVide, 0, 10);
    expect(resteAvantQuiz(cours, { videos: [vue, visionnageVide, vue], fichesLues: true })).toEqual([
      'regarder la vidéo 2 en entier',
    ]);
  });

  it('ouvre le quiz quand tout est fait', () => {
    const vue = lire(visionnageVide, 0, 10);
    expect(resteAvantQuiz(cours, { videos: [vue, vue, vue], fichesLues: true })).toEqual([]);
  });
});
