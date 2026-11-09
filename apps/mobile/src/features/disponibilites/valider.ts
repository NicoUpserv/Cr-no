import type { DisponibilitesMoniteur } from '@/data/types';

export type ErreurDisponibilite = {
  /** Chemin du champ : 'routine.0.fin', 'ouvertures.1.date', 'absences.0.au'… */
  champ: string;
  message: string;
};

const MESSAGE_HEURE = 'Heure invalide : utilisez le format HH:MM (ex. 08:30).';
const MESSAGE_ORDRE_HEURES = "L'heure de fin doit être après l'heure de début.";
const MESSAGE_CHEVAUCHEMENT = 'Ce créneau chevauche un autre créneau du même jour.';
const MESSAGE_DATE_OUVERTURE = "La date doit être aujourd'hui ou plus tard.";
const MESSAGE_ORDRE_DATES = 'La date de fin doit être après la date de début.';

const FORMAT_HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORMAT_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function estHeureValide(heure: string): boolean {
  return FORMAT_HEURE.test(heure);
}

function enMinutes(heure: string): number {
  const [heures, minutes] = heure.split(':').map(Number);
  return heures * 60 + minutes;
}

/** Vérifie le format « YYYY-MM-DD » et l'existence réelle de la date au calendrier. */
function estDateValide(date: string): boolean {
  const correspondance = FORMAT_DATE.exec(date);
  if (!correspondance) return false;

  const annee = Number(correspondance[1]);
  const mois = Number(correspondance[2]);
  const jour = Number(correspondance[3]);
  const reelle = new Date(Date.UTC(annee, mois - 1, jour));

  return (
    reelle.getUTCFullYear() === annee &&
    reelle.getUTCMonth() === mois - 1 &&
    reelle.getUTCDate() === jour
  );
}

/**
 * Valide les disponibilités d'un enseignant avant enregistrement.
 * `aujourdHui` est au format « YYYY-MM-DD ».
 */
export function validerDisponibilites(
  d: DisponibilitesMoniteur,
  aujourdHui: string,
): ErreurDisponibilite[] {
  const erreurs: ErreurDisponibilite[] = [];

  /* ----- Horaires habituels ----- */

  const creneauxValides: { index: number; jour: number; debut: number; fin: number }[] = [];

  d.routine.forEach((creneau, index) => {
    const debutValide = estHeureValide(creneau.debut);
    const finValide = estHeureValide(creneau.fin);

    if (debutValide && finValide) {
      const debut = enMinutes(creneau.debut);
      const fin = enMinutes(creneau.fin);
      if (fin > debut) creneauxValides.push({ index, jour: creneau.jour, debut, fin });
    }
  });

  const enChevauchement = new Set<number>();
  for (let i = 0; i < creneauxValides.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      const precedent = creneauxValides[j];
      const suivant = creneauxValides[i];
      if (precedent.jour !== suivant.jour) continue;
      if (suivant.debut < precedent.fin && precedent.debut < suivant.fin) {
        enChevauchement.add(suivant.index);
      }
    }
  }

  d.routine.forEach((creneau, index) => {
    const debutValide = estHeureValide(creneau.debut);
    const finValide = estHeureValide(creneau.fin);

    if (!debutValide) {
      erreurs.push({ champ: `routine.${index}.debut`, message: MESSAGE_HEURE });
    }
    if (!finValide) {
      erreurs.push({ champ: `routine.${index}.fin`, message: MESSAGE_HEURE });
    }
    if (debutValide && finValide && enMinutes(creneau.fin) <= enMinutes(creneau.debut)) {
      erreurs.push({ champ: `routine.${index}.fin`, message: MESSAGE_ORDRE_HEURES });
    }
    if (enChevauchement.has(index)) {
      erreurs.push({ champ: `routine.${index}.debut`, message: MESSAGE_CHEVAUCHEMENT });
    }
  });

  /* ----- Ouvertures ponctuelles ----- */

  d.ouvertures.forEach((ouverture, index) => {
    if (!estDateValide(ouverture.date) || ouverture.date < aujourdHui) {
      erreurs.push({ champ: `ouvertures.${index}.date`, message: MESSAGE_DATE_OUVERTURE });
    }

    const debutValide = estHeureValide(ouverture.debut);
    const finValide = estHeureValide(ouverture.fin);

    if (!debutValide) {
      erreurs.push({ champ: `ouvertures.${index}.debut`, message: MESSAGE_HEURE });
    }
    if (!finValide) {
      erreurs.push({ champ: `ouvertures.${index}.fin`, message: MESSAGE_HEURE });
    }
    if (debutValide && finValide && enMinutes(ouverture.fin) <= enMinutes(ouverture.debut)) {
      erreurs.push({ champ: `ouvertures.${index}.fin`, message: MESSAGE_ORDRE_HEURES });
    }
  });

  /* ----- Absences ----- */

  d.absences.forEach((absence, index) => {
    const duValide = estDateValide(absence.du);
    const auValide = estDateValide(absence.au);

    if (!duValide || !auValide || absence.du > absence.au) {
      erreurs.push({ champ: `absences.${index}.au`, message: MESSAGE_ORDRE_DATES });
    }
  });

  return erreurs;
}
