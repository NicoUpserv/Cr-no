/**
 * Calendrier du planning : vues jour / semaine / mois / année.
 * Fonctions pures, en heure locale ; dates « YYYY-MM-DD ». La semaine commence le lundi.
 */
import { dateLocale, midiLocal } from './creneaux';

export type VueCalendrier = 'jour' | 'semaine' | 'mois' | 'annee';

export const VUES: { valeur: VueCalendrier; libelle: string }[] = [
  { valeur: 'jour', libelle: 'Jour' },
  { valeur: 'semaine', libelle: 'Semaine' },
  { valeur: 'mois', libelle: 'Mois' },
  { valeur: 'annee', libelle: 'Année' },
];

const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
/** Initiales des jours, du lundi au dimanche. */
export const INITIALES_JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const plus = (date: string, jours: number) => {
  const d = midiLocal(date);
  d.setDate(d.getDate() + jours);
  return dateLocale(d);
};

/** Lundi de la semaine de cette date. */
export function debutSemaine(date: string): string {
  const jour = midiLocal(date).getDay(); // 0 = dimanche
  return plus(date, jour === 0 ? -6 : 1 - jour);
}

/** Les 7 jours (lundi → dimanche) de la semaine de cette date. */
export function joursSemaine(date: string): string[] {
  const lundi = debutSemaine(date);
  return Array.from({ length: 7 }, (_, i) => plus(lundi, i));
}

export type CaseMois = { date: string; dansLeMois: boolean };

/** Grille du mois en semaines complètes (lundi → dimanche), jours voisins compris. */
export function grilleMois(annee: number, mois: number): CaseMois[][] {
  const premier = dateLocale(new Date(annee, mois, 1, 12));
  const semaines: CaseMois[][] = [];
  let lundi = debutSemaine(premier);
  do {
    const jours = Array.from({ length: 7 }, (_, i) => plus(lundi, i));
    semaines.push(jours.map((date) => ({ date, dansLeMois: midiLocal(date).getMonth() === mois })));
    lundi = plus(lundi, 7);
  } while (midiLocal(lundi).getMonth() === mois && midiLocal(lundi).getFullYear() === annee);
  return semaines;
}

/** Avance ou recule d'une période (jour, semaine, mois ou année). */
export function decaler(date: string, vue: VueCalendrier, n: number): string {
  if (vue === 'jour') return plus(date, n);
  if (vue === 'semaine') return plus(date, 7 * n);
  const d = midiLocal(date);
  if (vue === 'mois') return dateLocale(new Date(d.getFullYear(), d.getMonth() + n, 1, 12));
  return dateLocale(new Date(d.getFullYear() + n, 0, 1, 12));
}

/** Titre de la période affichée : « lundi 16 novembre », « 16 – 22 nov. », « novembre 2026 », « 2026 ». */
export function titrePeriode(date: string, vue: VueCalendrier): string {
  const d = midiLocal(date);
  if (vue === 'jour') return `${JOURS_LONGS[d.getDay()]} ${d.getDate()} ${MOIS_LONGS[d.getMonth()]}`;
  if (vue === 'mois') return `${MOIS_LONGS[d.getMonth()]} ${d.getFullYear()}`;
  if (vue === 'annee') return String(d.getFullYear());
  const [lundi, , , , , , dimanche] = joursSemaine(date).map(midiLocal);
  return lundi.getMonth() === dimanche.getMonth()
    ? `${lundi.getDate()} – ${dimanche.getDate()} ${MOIS_COURTS[dimanche.getMonth()]}`
    : `${lundi.getDate()} ${MOIS_COURTS[lundi.getMonth()]} – ${dimanche.getDate()} ${MOIS_COURTS[dimanche.getMonth()]}`;
}

export const nomMois = (mois: number) => MOIS_LONGS[mois];

/** La période affichée contient-elle aujourd'hui ? (pour le bouton « Aujourd'hui »). */
export function contientAujourdhui(date: string, vue: VueCalendrier, maintenant: Date): boolean {
  const aujourdhui = dateLocale(maintenant);
  if (vue === 'jour') return date === aujourdhui;
  if (vue === 'semaine') return debutSemaine(date) === debutSemaine(aujourdhui);
  const d = midiLocal(date);
  if (vue === 'mois') return d.getFullYear() === maintenant.getFullYear() && d.getMonth() === maintenant.getMonth();
  return d.getFullYear() === maintenant.getFullYear();
}

/** Nombre d'éléments par date locale. */
export function compterParJour(elements: { debut: string }[]): Map<string, number> {
  const compte = new Map<string, number>();
  for (const e of elements) {
    const jour = dateLocale(e.debut);
    compte.set(jour, (compte.get(jour) ?? 0) + 1);
  }
  return compte;
}

/** Plage horaire affichée dans la vue semaine. */
export const HEURE_DEBUT = 7;
export const HEURE_FIN = 21;

/** Position verticale d'un créneau dans la journée affichée (fractions de la hauteur, bornées). */
export function positionDansJournee(debut: string, fin: string): { haut: number; hauteur: number } {
  const total = (HEURE_FIN - HEURE_DEBUT) * 60;
  const minutes = (iso: string) => {
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes() - HEURE_DEBUT * 60;
  };
  const a = Math.max(0, Math.min(total, minutes(debut)));
  const b = Math.max(0, Math.min(total, minutes(fin) <= minutes(debut) ? total : minutes(fin)));
  return { haut: a / total, hauteur: Math.max(0, b - a) / total };
}

/**
 * Répartit des créneaux qui se chevauchent en colonnes (pour les afficher côte à côte).
 * Renvoie, pour chaque élément, sa colonne et le nombre de colonnes de son groupe.
 */
export function repartirEnColonnes<T extends { debut: string; fin: string }>(
  elements: T[],
): { element: T; colonne: number; colonnes: number }[] {
  const tries = [...elements].sort((a, b) => a.debut.localeCompare(b.debut) || b.fin.localeCompare(a.fin));
  const resultat: { element: T; colonne: number; colonnes: number }[] = [];
  let groupe: { element: T; colonne: number }[] = [];
  let finGroupe = '';
  const fermer = () => {
    const colonnes = Math.max(1, ...groupe.map((g) => g.colonne + 1));
    resultat.push(...groupe.map((g) => ({ ...g, colonnes })));
    groupe = [];
  };
  for (const element of tries) {
    if (groupe.length > 0 && element.debut >= finGroupe) fermer();
    const occupees = groupe.filter((g) => g.element.fin > element.debut).map((g) => g.colonne);
    let colonne = 0;
    while (occupees.includes(colonne)) colonne += 1;
    groupe.push({ element, colonne });
    // Le groupe dure jusqu'à la fin la plus tardive de ses créneaux.
    if (groupe.length === 1 || element.fin > finGroupe) finGroupe = element.fin;
  }
  if (groupe.length > 0) fermer();
  return resultat;
}
