/** Textes d'alerte du cours avant la leçon, selon l'état du suivi (trois états). */
import { formatDateCourte } from '@/lib/format';

import { meilleurScore } from './quiz';
import type { Cours, SuiviCours } from './types';

export type AlerteCours = { titre: string; preuve: string };

/** Alerte vue par l'enseignant (vouvoiement inutile : phrases nominales). Null si le cours est validé. */
export function alerteEnseignant(cours: Cours, suivi: SuiviCours, envoyeLe: string): AlerteCours | null {
  if (suivi.statut === 'valide') return null;
  if (suivi.statut === 'non-commence') {
    return { titre: `Cours non commencé : ${cours.titre}`, preuve: `Envoyé le ${formatDateCourte(envoyeLe)} · jamais ouvert` };
  }
  const meilleur = meilleurScore(suivi);
  const n = suivi.tentatives.length;
  return {
    titre: `Quiz non réussi : ${cours.titre}`,
    preuve: `Meilleur score ${meilleur ? `${meilleur.score}/${meilleur.total}` : '—'} · ${n} tentative${n > 1 ? 's' : ''} · ${cours.seuilReussite}/${cours.nbQuestionsAffichees} requis`,
  };
}

/** Alerte vue par l'élève (tutoiement). Null si le cours est validé. */
export function alerteEleve(cours: Cours, suivi: SuiviCours, heureLecon: string): AlerteCours | null {
  if (suivi.statut === 'valide') return null;
  if (suivi.statut === 'non-commence') {
    return {
      titre: `Ton cours à faire avant la leçon : ${cours.titre}`,
      preuve: `Environ 15 min · à valider avant ${heureLecon}. Sinon, ton enseignant devra prendre du temps sur ta leçon.`,
    };
  }
  const meilleur = meilleurScore(suivi);
  return {
    titre: `Quiz pas encore réussi : ${cours.titre}`,
    preuve: `Ton meilleur score : ${meilleur ? `${meilleur.score}/${meilleur.total}` : '—'}. Relis la fiche, revois la vidéo et refais le quiz avant ${heureLecon}.`,
  };
}
