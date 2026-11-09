import type { DisponibiliteRoutine, Lecon, OuverturePonctuelle, PreferencesEleve } from '@/data/types';

export type CreneauAlerte = {
  eleveId: string;
  /** 'YYYY-MM-DD' : la date de l'ouverture */
  date: string;
  /** 'HH:MM' : début de la fenêtre proposée à l'élève */
  debut: string;
  /** 'HH:MM' : fin de la fenêtre proposée à l'élève */
  fin: string;
};

/** Plage horaire exprimée en minutes depuis minuit. */
type PlageMinutes = { debut: number; fin: number };

/** Plage horaire exprimée en millisecondes depuis l'époque. */
type PlageMs = { debut: number; fin: number };

const DUREE_MINIMALE_PAR_DEFAUT = 60;

/** « HH:MM » → minutes depuis minuit. */
function enMinutes(heure: string): number {
  const [heures, minutes] = heure.split(':').map(Number);
  return heures * 60 + minutes;
}

/** Minutes depuis minuit → « HH:MM ». */
function enHeure(minutes: number): string {
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return `${String(heures).padStart(2, '0')}:${String(reste).padStart(2, '0')}`;
}

/** « YYYY-MM-DD » → jour ISO (1 = lundi … 7 = dimanche). */
function jourIso(date: string): number {
  const [annee, mois, jour] = date.split('-').map(Number);
  const jourSemaine = new Date(annee, mois - 1, jour).getDay();
  return jourSemaine === 0 ? 7 : jourSemaine;
}

/** Date locale du téléphone au format « YYYY-MM-DD ». */
function dateLocale(instant: Date): string {
  const annee = instant.getFullYear();
  const mois = String(instant.getMonth() + 1).padStart(2, '0');
  const jour = String(instant.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

/** Instant local correspondant à une date « YYYY-MM-DD » et une heure en minutes. */
function instantLocal(date: string, minutes: number): Date {
  const [annee, mois, jour] = date.split('-').map(Number);
  return new Date(annee, mois - 1, jour, Math.floor(minutes / 60), minutes % 60);
}

/** Fusionne des plages qui se chevauchent ou se touchent. */
function fusionner(plages: PlageMinutes[]): PlageMinutes[] {
  const triees = [...plages].sort((a, b) => a.debut - b.debut);
  const fusionnees: PlageMinutes[] = [];

  for (const plage of triees) {
    const derniere = fusionnees[fusionnees.length - 1];
    if (derniere && plage.debut <= derniere.fin) {
      derniere.fin = Math.max(derniere.fin, plage.fin);
    } else {
      fusionnees.push({ ...plage });
    }
  }

  return fusionnees;
}

/** Retire les plages bloquées d'une plage de base ; peut produire plusieurs morceaux. */
function soustraire(base: PlageMinutes, blocs: PlageMinutes[]): PlageMinutes[] {
  let morceaux: PlageMinutes[] = [base];

  for (const bloc of blocs) {
    const suivants: PlageMinutes[] = [];
    for (const morceau of morceaux) {
      if (bloc.fin <= morceau.debut || bloc.debut >= morceau.fin) {
        suivants.push(morceau);
        continue;
      }
      if (bloc.debut > morceau.debut) {
        suivants.push({ debut: morceau.debut, fin: bloc.debut });
      }
      if (bloc.fin < morceau.fin) {
        suivants.push({ debut: bloc.fin, fin: morceau.fin });
      }
    }
    morceaux = suivants;
  }

  return morceaux;
}

/** Retire la partie déjà passée, à la minute près (secondes tronquées). */
function retirerPasse(morceaux: PlageMinutes[], date: string, maintenant: Date): PlageMinutes[] {
  const aujourdHui = dateLocale(maintenant);
  if (date < aujourdHui) return [];
  if (date > aujourdHui) return morceaux;

  const maintenantEnMinutes = maintenant.getHours() * 60 + maintenant.getMinutes();
  return morceaux
    .map((morceau) => ({ debut: Math.max(morceau.debut, maintenantEnMinutes), fin: morceau.fin }))
    .filter((morceau) => morceau.fin > morceau.debut);
}

/** Vrai si une leçon occupe la fenêtre (se toucher n'est pas chevaucher). */
function estOccupee(fenetre: PlageMinutes, date: string, occupations: PlageMs[]): boolean {
  const debut = instantLocal(date, fenetre.debut).getTime();
  const fin = instantLocal(date, fenetre.fin).getTime();
  return occupations.some((occupation) => occupation.debut < fin && debut < occupation.fin);
}

/** Regroupe les leçons par élève, quel que soit l'enseignant. */
function occuperParEleve(lecons: Lecon[]): Map<string, PlageMs[]> {
  const occupations = new Map<string, PlageMs[]>();

  for (const lecon of lecons) {
    const debut = new Date(lecon.debut).getTime();
    const fin = new Date(lecon.fin).getTime();
    if (!Number.isFinite(debut) || !Number.isFinite(fin) || fin <= debut) continue;

    const liste = occupations.get(lecon.eleveId) ?? [];
    liste.push({ debut, fin });
    occupations.set(lecon.eleveId, liste);
  }

  return occupations;
}

/**
 * Détermine les élèves à prévenir quand un enseignant ouvre un créneau
 * en dehors de ses horaires habituels.
 *
 * Fonction pure : aucune lecture du dépôt, aucune horloge implicite.
 */
export function elevesANotifier(params: {
  moniteurId: string;
  ouverture: OuverturePonctuelle;
  routine: DisponibiliteRoutine[];
  preferences: PreferencesEleve[];
  lecons: Lecon[];
  maintenant: Date;
  /** Durée minimale d'une fenêtre, en minutes. Par défaut 60. */
  dureeMinimale?: number;
}): CreneauAlerte[] {
  const { moniteurId, ouverture, routine, preferences, lecons, maintenant } = params;
  const dureeMinimale = params.dureeMinimale ?? DUREE_MINIMALE_PAR_DEFAUT;

  const debutOuverture = enMinutes(ouverture.debut);
  const finOuverture = enMinutes(ouverture.fin);
  if (finOuverture <= debutOuverture) return [];

  const jour = jourIso(ouverture.date);

  /* ----- Partie inhabituelle : ouverture moins la routine du même jour ----- */

  const blocs = fusionner(
    routine
      .filter((creneau) => creneau.jour === jour)
      .map((creneau) => ({ debut: enMinutes(creneau.debut), fin: enMinutes(creneau.fin) }))
      .filter((creneau) => creneau.fin > creneau.debut),
  );

  const morceaux = retirerPasse(
    soustraire({ debut: debutOuverture, fin: finOuverture }, blocs),
    ouverture.date,
    maintenant,
  );

  if (morceaux.length === 0) return [];

  const occupations = occuperParEleve(lecons);
  const retenues = new Map<string, PlageMinutes>();

  /* ----- Fenêtres proposables, une seule alerte par élève ----- */

  for (const preference of preferences) {
    if (!preference.moniteursFavorisIds.includes(moniteurId)) continue;

    const fenetres = preference.creneaux
      .filter((creneau) => creneau.jour === jour)
      .flatMap((creneau) => {
        const debutCreneau = enMinutes(creneau.debut);
        const finCreneau = enMinutes(creneau.fin);
        if (finCreneau <= debutCreneau) return [];

        return morceaux
          .map((morceau) => ({
            debut: Math.max(debutCreneau, morceau.debut),
            fin: Math.min(finCreneau, morceau.fin),
          }))
          .filter(
            (fenetre) => fenetre.fin > fenetre.debut && fenetre.fin - fenetre.debut >= dureeMinimale,
          );
      })
      .sort((a, b) => a.debut - b.debut || a.fin - b.fin);

    const libre = fenetres.find(
      (fenetre) => !estOccupee(fenetre, ouverture.date, occupations.get(preference.eleveId) ?? []),
    );
    if (!libre) continue;

    const actuelle = retenues.get(preference.eleveId);
    if (
      !actuelle ||
      libre.debut < actuelle.debut ||
      (libre.debut === actuelle.debut && libre.fin < actuelle.fin)
    ) {
      retenues.set(preference.eleveId, libre);
    }
  }

  return [...retenues.entries()]
    .map(([eleveId, fenetre]) => ({
      eleveId,
      date: ouverture.date,
      debut: enHeure(fenetre.debut),
      fin: enHeure(fenetre.fin),
    }))
    .sort((a, b) => {
      if (a.debut !== b.debut) return a.debut < b.debut ? -1 : 1;
      return a.eleveId.localeCompare(b.eleveId);
    });
}
