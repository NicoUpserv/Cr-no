/**
 * Verrou du quiz (docs/cours-avant-lecon.md, décision du 11/11/2026) :
 * le quiz ne s'ouvre que si chaque vidéo a été regardée à 95 % au moins,
 * sans avance rapide au premier visionnage, et si les fiches ont été parcourues jusqu'en bas.
 *
 * Limite assumée : on mesure le temps de lecture réel, pas l'attention de l'élève.
 */
import type { Cours } from './types';

/** Part de la vidéo à regarder pour qu'elle compte comme vue. */
export const SEUIL_VISIONNAGE = 0.95;
/**
 * Écart maximal entre deux mesures de position compté comme de la lecture normale (en secondes).
 * Au-delà, c'est un saut (avance rapide) : le temps sauté ne compte pas.
 */
export const ECART_LECTURE_MAX = 2;

export type Visionnage = {
  /** Secondes réellement regardées (lecture continue). */
  secondesVues: number;
  /** Position la plus loin atteinte en lecture continue. */
  positionMax: number;
  /** Vue en entier : l'avance rapide est alors autorisée. */
  terminee: boolean;
};

export type ProgressionCours = {
  videos: Visionnage[];
  fichesLues: boolean;
};

export const visionnageVide: Visionnage = { secondesVues: 0, positionMax: 0, terminee: false };

export function progressionVide(cours: Cours): ProgressionCours {
  return { videos: cours.videos.map(() => visionnageVide), fichesLues: false };
}

/**
 * Met à jour le visionnage à partir de deux positions successives du lecteur.
 * Seule la lecture continue (petit écart positif) compte.
 */
export function avancerVisionnage(
  v: Visionnage,
  positionPrecedente: number,
  positionActuelle: number,
  duree: number,
): Visionnage {
  const ecart = positionActuelle - positionPrecedente;
  if (ecart <= 0 || ecart > ECART_LECTURE_MAX || duree <= 0) return v;
  const secondesVues = Math.min(duree, v.secondesVues + ecart);
  return {
    secondesVues,
    positionMax: Math.max(v.positionMax, positionActuelle),
    terminee: v.terminee || secondesVues >= duree * SEUIL_VISIONNAGE,
  };
}

/**
 * Position où ramener la lecture si l'élève a sauté en avant avant d'avoir tout vu,
 * ou `null` si la position est autorisée.
 */
export function positionAutorisee(v: Visionnage, position: number): number | null {
  if (v.terminee) return null;
  return position > v.positionMax + ECART_LECTURE_MAX ? v.positionMax : null;
}

/** Ce qu'il reste à faire avant le quiz, en phrases courtes (vide = quiz ouvert). */
export function resteAvantQuiz(cours: Cours, progression: ProgressionCours): string[] {
  const reste: string[] = [];
  const nonVues = cours.videos
    .map((_, i) => i)
    .filter((i) => !(progression.videos[i]?.terminee ?? false));
  if (nonVues.length === 1) reste.push(`regarder la vidéo ${nonVues[0] + 1} en entier`);
  if (nonVues.length > 1) reste.push(`regarder les vidéos ${listerNumeros(nonVues.map((i) => i + 1))} en entier`);
  if (!progression.fichesLues) {
    reste.push(cours.fiches.length > 1 ? 'lire les fiches jusqu’en bas' : 'lire la fiche jusqu’en bas');
  }
  return reste;
}

/** Pourcentage regardé d'une vidéo (arrondi, 0 à 100). */
export function pourcentageVu(v: Visionnage, duree: number): number {
  if (v.terminee) return 100;
  if (duree <= 0) return 0;
  return Math.min(99, Math.round((v.secondesVues / duree) * 100));
}

function listerNumeros(numeros: number[]): string {
  if (numeros.length <= 1) return numeros.join('');
  return `${numeros.slice(0, -1).join(', ')} et ${numeros[numeros.length - 1]}`;
}
