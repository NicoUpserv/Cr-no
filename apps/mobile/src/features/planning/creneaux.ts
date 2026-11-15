/**
 * Planning : créneaux libres d'un enseignant, règles d'annulation, numérotation des leçons.
 * Fonctions pures (heure locale du téléphone ; dates « YYYY-MM-DD », heures « HH:MM », instants ISO).
 */
import type { Absence, DisponibilitesMoniteur, Lecon, Plage } from '@/data/types';

/** Durée d'une leçon de conduite. */
export const DUREE_LECON_MINUTES = 60;
/** Un élève peut annuler gratuitement jusqu'à 48 h avant la leçon. */
export const DELAI_ANNULATION_HEURES = 48;

export type Creneau = {
  moniteurId: string;
  /** Instant ISO. */
  debut: string;
  fin: string;
};

export type RolePlanning = 'eleve' | 'enseignant' | 'direction';

const enMinutes = (heure: string) => {
  const [h, m] = heure.split(':').map(Number);
  return h * 60 + m;
};

/** Date locale « YYYY-MM-DD » d'un instant. */
export function dateLocale(instant: Date | string): string {
  const d = new Date(instant);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** « YYYY-MM-DD » → midi, heure locale (pour l'afficher sans décalage de fuseau). */
export function midiLocal(date: string): Date {
  const [a, m, j] = date.split('-').map(Number);
  return new Date(a, m - 1, j, 12);
}

/** Les `n` prochains jours, aujourd'hui compris (« YYYY-MM-DD »). */
export function joursAVenir(maintenant: Date, n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() + i);
    return dateLocale(d);
  });
}

/** 1 = lundi … 7 = dimanche. */
function jourIso(date: string): number {
  const [a, m, j] = date.split('-').map(Number);
  const jour = new Date(a, m - 1, j).getDay();
  return jour === 0 ? 7 : jour;
}

function instant(date: string, minutes: number): Date {
  const [a, m, j] = date.split('-').map(Number);
  return new Date(a, m - 1, j, Math.floor(minutes / 60), minutes % 60);
}

/** Absence qui couvre cette date, s'il y en a une. */
export function absenceLe(dispos: DisponibilitesMoniteur, date: string): Absence | undefined {
  return dispos.absences.find((a) => a.du <= date && date <= a.au);
}

/** Plages de travail d'un jour : horaires habituels de ce jour de la semaine + ouvertures ponctuelles. */
export function plagesDuJour(dispos: DisponibilitesMoniteur, date: string): Plage[] {
  if (absenceLe(dispos, date)) return [];
  const jour = jourIso(date);
  return [
    ...dispos.routine.filter((r) => r.jour === jour).map(({ debut, fin }) => ({ debut, fin })),
    ...dispos.ouvertures.filter((o) => o.date === date).map(({ debut, fin }) => ({ debut, fin })),
  ];
}

const chevauche = (a: { debut: string; fin: string }, b: { debut: string; fin: string }) =>
  new Date(a.debut) < new Date(b.fin) && new Date(b.debut) < new Date(a.fin);

/**
 * Créneaux d'une leçon libres pour un enseignant un jour donné :
 * découpés dans ses plages de travail, sans chevaucher ses leçons, et pas dans le passé.
 */
export function creneauxLibres(
  dispos: DisponibilitesMoniteur,
  lecons: Lecon[],
  date: string,
  maintenant: Date,
  duree = DUREE_LECON_MINUTES,
): Creneau[] {
  const siennes = lecons.filter((l) => l.moniteurId === dispos.moniteurId);
  const parDebut = new Map<string, Creneau>();
  for (const plage of plagesDuJour(dispos, date)) {
    for (let m = enMinutes(plage.debut); m + duree <= enMinutes(plage.fin); m += duree) {
      const debut = instant(date, m);
      if (debut <= maintenant) continue;
      const creneau = {
        moniteurId: dispos.moniteurId,
        debut: debut.toISOString(),
        fin: new Date(debut.getTime() + duree * 60_000).toISOString(),
      };
      if (!siennes.some((l) => chevauche(l, creneau))) parDebut.set(creneau.debut, creneau);
    }
  }
  return [...parDebut.values()].sort((a, b) => a.debut.localeCompare(b.debut));
}

/**
 * Qui peut annuler une leçon (règles du client) :
 * - l'élève, jusqu'à 48 h avant ;
 * - l'enseignant, jamais (seule la direction peut retirer un élève) ;
 * - la direction, tant que la leçon n'a pas commencé.
 */
export function peutAnnuler(lecon: Pick<Lecon, 'debut'>, role: RolePlanning, maintenant: Date): boolean {
  const avant = new Date(lecon.debut).getTime() - maintenant.getTime();
  if (role === 'direction') return avant > 0;
  if (role === 'eleve') return avant >= DELAI_ANNULATION_HEURES * 3_600_000;
  return false;
}

/**
 * Numérote les leçons de chaque élève dans l'ordre chronologique (L14, L15…),
 * à partir du plus petit numéro connu. Une leçon nouvellement réservée (numéro 0) prend sa place.
 */
export function numeroterLecons(lecons: Lecon[]): Lecon[] {
  const parEleve = new Map<string, Lecon[]>();
  for (const l of lecons) parEleve.set(l.eleveId, [...(parEleve.get(l.eleveId) ?? []), l]);
  const numeros = new Map<string, number>();
  for (const siennes of parEleve.values()) {
    const connus = siennes.map((l) => l.numero).filter((n) => n > 0);
    const base = connus.length > 0 ? Math.min(...connus) : 1;
    [...siennes].sort((a, b) => a.debut.localeCompare(b.debut)).forEach((l, i) => numeros.set(l.id, base + i));
  }
  return lecons.map((l) => ({ ...l, numero: numeros.get(l.id) ?? l.numero }));
}
