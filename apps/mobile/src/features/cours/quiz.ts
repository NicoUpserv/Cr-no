/**
 * Quiz du cours avant la leçon — fonctions pures.
 * Tirage aléatoire des questions ET de l'ordre des réponses à chaque passage.
 */
import type { Cours, QuestionTiree, ResultatQuiz, StatutCours, SuiviCours, Tentative } from './types';

/** Générateur aléatoire injectable (tests déterministes). Renvoie un nombre dans [0, 1[. */
export type Aleatoire = () => number;

/** Mélange de Fisher-Yates, sans modifier le tableau reçu. */
export function melanger<T>(elements: readonly T[], aleatoire: Aleatoire = Math.random): T[] {
  const copie = [...elements];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(aleatoire() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Tire les questions d'un quiz.
 * Évite d'abord les questions déjà vues aux tentatives précédentes, puis complète
 * avec les autres si la banque est trop petite.
 */
export function tirerQuiz(cours: Cours, dejaVuesIds: string[] = [], aleatoire: Aleatoire = Math.random): QuestionTiree[] {
  const n = Math.min(cours.nbQuestionsAffichees, cours.banqueQuestions.length);
  const nouvelles = melanger(
    cours.banqueQuestions.filter((q) => !dejaVuesIds.includes(q.id)),
    aleatoire,
  );
  const dejaVues = melanger(
    cours.banqueQuestions.filter((q) => dejaVuesIds.includes(q.id)),
    aleatoire,
  );
  return [...nouvelles, ...dejaVues].slice(0, n).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    explication: q.explication,
    reponses: melanger(q.reponses, aleatoire),
  }));
}

/**
 * Corrige un quiz. `reponses[i]` est l'indice de la réponse choisie pour la question i
 * (dans l'ordre affiché), ou null si l'élève n'a pas répondu.
 */
export function corrigerQuiz(questions: QuestionTiree[], reponses: (number | null)[], seuilReussite: number): ResultatQuiz {
  const ratees: ResultatQuiz['ratees'] = [];
  let score = 0;
  questions.forEach((question, i) => {
    const choix = reponses[i] ?? null;
    const bonne = question.reponses.find((r) => r.correcte);
    if (choix !== null && question.reponses[choix]?.correcte) {
      score += 1;
    } else {
      ratees.push({
        question,
        reponseDonnee: choix !== null ? (question.reponses[choix]?.texte ?? null) : null,
        bonneReponse: bonne?.texte ?? '',
      });
    }
  });
  return { score, total: questions.length, valide: score >= seuilReussite, ratees };
}

/** Ajoute une tentative au suivi et recalcule le statut (un cours validé le reste). */
export function enregistrerTentative(suivi: SuiviCours, resultat: ResultatQuiz, date: Date): SuiviCours {
  const tentative: Tentative = {
    date: date.toISOString(),
    score: resultat.score,
    total: resultat.total,
    questionsRateesIds: resultat.ratees.map((r) => r.question.id),
  };
  const statut: StatutCours = suivi.statut === 'valide' || resultat.valide ? 'valide' : 'commence';
  return { ...suivi, statut, tentatives: [...suivi.tentatives, tentative] };
}

/** Meilleur score obtenu, ou null si aucune tentative. */
export function meilleurScore(suivi: SuiviCours): { score: number; total: number } | null {
  if (suivi.tentatives.length === 0) return null;
  return suivi.tentatives.reduce((meilleur, t) => (t.score > meilleur.score ? { score: t.score, total: t.total } : meilleur), {
    score: suivi.tentatives[0].score,
    total: suivi.tentatives[0].total,
  });
}
