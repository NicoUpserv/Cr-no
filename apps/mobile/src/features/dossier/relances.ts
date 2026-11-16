/**
 * Relances du dossier (pièces manquantes) : automatiques à J+3, J+7 et J+14 après l'inscription,
 * puis la direction est alertée et relance elle-même. Message dans l'appli + e-mail (e-mail pas encore actif dans la démo).
 */
import { dateLocale, midiLocal } from '@/features/planning/creneaux';

export const JOURS_RELANCE = [3, 7, 14] as const;

export type CalendrierRelances = {
  /** Relances automatiques déjà parties (« YYYY-MM-DD »). */
  envoyees: string[];
  /** Prochaine relance automatique, ou undefined quand les trois sont parties. */
  prochaine?: string;
};

export function calendrierRelances(inscritLe: string, maintenant: Date): CalendrierRelances {
  const aujourdhui = dateLocale(maintenant);
  const dates = JOURS_RELANCE.map((j) => {
    const d = midiLocal(inscritLe);
    d.setDate(d.getDate() + j);
    return dateLocale(d);
  });
  return { envoyees: dates.filter((d) => d <= aujourdhui), prochaine: dates.find((d) => d > aujourdhui) };
}

/** Texte de relance, au tutoiement (destiné à l'élève). */
export function texteRelance(prenom: string, pieces: string[]): string {
  const liste = pieces.map((p) => p.charAt(0).toLowerCase() + p.slice(1)).join(', ');
  return `Bonjour ${prenom}, il manque encore ${pieces.length > 1 ? 'des pièces' : 'une pièce'} à ton dossier : ${liste}. Envoie-${pieces.length > 1 ? 'les' : 'la'} depuis Mes infos (une photo lisible suffit).`;
}
