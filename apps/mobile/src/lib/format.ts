/** Formats de dates et d'heures en français (fr-FR), sans dépendance externe. */

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const deux = (n: number) => String(n).padStart(2, '0');

/** « 14:00 » */
export function formatHeure(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${deux(d.getHours())}:${deux(d.getMinutes())}`;
}

function memeJour(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** « Aujourd'hui », « Demain », « Hier » ou « mar. 12 nov. » */
export function formatJour(date: Date | string, maintenant = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const demain = new Date(maintenant);
  demain.setDate(demain.getDate() + 1);
  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  if (memeJour(d, maintenant)) return 'Aujourd’hui';
  if (memeJour(d, demain)) return 'Demain';
  if (memeJour(d, hier)) return 'Hier';
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

/** « 10 nov. » */
export function formatDateCourte(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}

/** « dans 35 min », « dans 2 h », « dans 3 jours », « en cours », « terminée » */
export function formatDans(debut: Date | string, fin: Date | string, maintenant = new Date()): string {
  const d = typeof debut === 'string' ? new Date(debut) : debut;
  const f = typeof fin === 'string' ? new Date(fin) : fin;
  if (maintenant >= f) return 'terminée';
  if (maintenant >= d) return 'en cours';
  const minutes = Math.round((d.getTime() - maintenant.getTime()) / 60_000);
  if (minutes < 60) return `dans ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `dans ${heures} h`;
  const jours = Math.round(heures / 24);
  return `dans ${jours} jour${jours > 1 ? 's' : ''}`;
}

/** « il y a 5 min », « il y a 3 h », « il y a 2 jours » */
export function formatIlYA(date: Date | string, maintenant = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const minutes = Math.max(0, Math.round((maintenant.getTime() - d.getTime()) / 60_000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  return `il y a ${jours} jour${jours > 1 ? 's' : ''}`;
}

/** « du 12 au 13 nov. » ou « le 12 nov. » à partir de dates « YYYY-MM-DD » */
export function formatPeriode(du: string, au: string): string {
  const d = new Date(`${du}T12:00:00`);
  const a = new Date(`${au}T12:00:00`);
  if (du === au) return `le ${formatDateCourte(d)}`;
  if (d.getMonth() === a.getMonth()) return `du ${d.getDate()} au ${formatDateCourte(a)}`;
  return `du ${formatDateCourte(d)} au ${formatDateCourte(a)}`;
}

/** « 1 fois », « 3 fois », « 0 fois » */
export function formatFois(n: number): string {
  return `${n} fois`;
}

/** « 2 documents manquants », « 1 document manquant » */
export function formatPiecesManquantes(n: number): string {
  if (n === 0) return 'Dossier complet';
  return `${n} document${n > 1 ? 's' : ''} manquant${n > 1 ? 's' : ''}`;
}
