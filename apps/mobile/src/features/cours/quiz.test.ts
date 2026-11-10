import { corrigerQuiz, enregistrerTentative, melanger, meilleurScore, tirerQuiz } from './quiz';
import type { Cours, SuiviCours } from './types';

/** Générateur pseudo-aléatoire déterministe (LCG). */
function graine(depart: number) {
  let s = depart;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const question = (id: string) => ({
  id,
  enonce: `Question ${id}`,
  reponses: [
    { texte: `${id}-bonne`, correcte: true },
    { texte: `${id}-a`, correcte: false },
    { texte: `${id}-b`, correcte: false },
  ],
  explication: `Explication ${id}`,
});

const cours: Cours = {
  id: 'c',
  titre: 'Cours',
  competence: 'C3',
  videos: [],
  fiches: [],
  banqueQuestions: Array.from({ length: 15 }, (_, i) => question(`q${i + 1}`)),
  nbQuestionsAffichees: 6,
  seuilReussite: 5,
};

describe('quiz du cours avant la leçon', () => {
  it('mélange sans perdre ni modifier les éléments', () => {
    const source = [1, 2, 3, 4, 5];
    const resultat = melanger(source, graine(1));
    expect([...resultat].sort()).toEqual(source);
    expect(source).toEqual([1, 2, 3, 4, 5]);
  });

  it('tire 6 questions différentes de la banque', () => {
    const quiz = tirerQuiz(cours, [], graine(2));
    expect(quiz).toHaveLength(6);
    expect(new Set(quiz.map((q) => q.id)).size).toBe(6);
  });

  it('mélange l’ordre des réponses : la bonne réponse n’est pas toujours la première', () => {
    const positions = tirerQuiz(cours, [], graine(3)).map((q) => q.reponses.findIndex((r) => r.correcte));
    expect(new Set(positions).size).toBeGreaterThan(1);
  });

  it('privilégie les questions jamais vues', () => {
    const vues = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
    const quiz = tirerQuiz(cours, vues, graine(4));
    expect(quiz.every((q) => !vues.includes(q.id))).toBe(true);
  });

  it('complète avec des questions déjà vues si la banque est trop petite', () => {
    const vues = cours.banqueQuestions.slice(0, 12).map((q) => q.id);
    const quiz = tirerQuiz(cours, vues, graine(5));
    expect(quiz).toHaveLength(6);
    expect(quiz.filter((q) => !vues.includes(q.id))).toHaveLength(3);
  });

  it('corrige : 5 sur 6 valide, avec les ratées pour le bilan', () => {
    const quiz = tirerQuiz(cours, [], graine(6));
    const reponses = quiz.map((q, i) => (i === 0 ? q.reponses.findIndex((r) => !r.correcte) : q.reponses.findIndex((r) => r.correcte)));
    const resultat = corrigerQuiz(quiz, reponses, 5);
    expect(resultat.score).toBe(5);
    expect(resultat.valide).toBe(true);
    expect(resultat.ratees).toHaveLength(1);
    expect(resultat.ratees[0].bonneReponse).toBe(`${quiz[0].id}-bonne`);
  });

  it('corrige : 4 sur 6 ne valide pas ; une question sans réponse compte comme ratée', () => {
    const quiz = tirerQuiz(cours, [], graine(7));
    const reponses = quiz.map((q, i) => (i < 2 ? null : q.reponses.findIndex((r) => r.correcte)));
    const resultat = corrigerQuiz(quiz, reponses, 5);
    expect(resultat.score).toBe(4);
    expect(resultat.valide).toBe(false);
    expect(resultat.ratees[0].reponseDonnee).toBeNull();
  });

  it('suit le statut : commencé après un échec, validé ensuite, et le reste', () => {
    const depart: SuiviCours = { eleveId: 'e', coursId: 'c', statut: 'non-commence', tentatives: [] };
    const echec = enregistrerTentative(depart, { score: 3, total: 6, valide: false, ratees: [] }, new Date());
    expect(echec.statut).toBe('commence');
    const reussite = enregistrerTentative(echec, { score: 6, total: 6, valide: true, ratees: [] }, new Date());
    expect(reussite.statut).toBe('valide');
    const apres = enregistrerTentative(reussite, { score: 2, total: 6, valide: false, ratees: [] }, new Date());
    expect(apres.statut).toBe('valide');
    expect(meilleurScore(apres)).toEqual({ score: 6, total: 6 });
  });
});
