/**
 * Données FICTIVES de démonstration. Aucune personne réelle.
 * Les leçons sont placées par rapport à « maintenant » pour que l'écran
 * ait toujours une prochaine leçon à afficher.
 */
import type { DisponibilitesMoniteur, Eleve, Lecon, Lieu, Moniteur, Observation, PreferencesEleve } from './types';

export const moniteurs: Moniteur[] = [
  { id: 'm-benali', prenom: 'Karim', nom: 'Benali' },
  { id: 'm-roux', prenom: 'Claire', nom: 'Roux' },
  { id: 'm-ortiz', prenom: 'Diego', nom: 'Ortiz' },
];

/** Enseignant connecté dans la démonstration. */
export const moniteurConnecteId = 'm-benali';

const competencesB = (acquises: [number, number, number, number]) =>
  [
    { code: 'C1', libelle: 'Maîtriser le maniement du véhicule', sousCompetencesTotal: 6, sousCompetencesAcquises: acquises[0] },
    { code: 'C2', libelle: 'Appréhender la route', sousCompetencesTotal: 7, sousCompetencesAcquises: acquises[1] },
    { code: 'C3', libelle: 'Circuler dans des conditions difficiles', sousCompetencesTotal: 7, sousCompetencesAcquises: acquises[2] },
    { code: 'C4', libelle: 'Pratiquer une conduite autonome et sûre', sousCompetencesTotal: 6, sousCompetencesAcquises: acquises[3] },
  ] as Eleve['competences'];

export const eleves: Eleve[] = [
  {
    id: 'e-morel',
    prenom: 'Lina',
    nom: 'Morel',
    telephone: '06 12 34 56 78',
    permis: 'B',
    forfaitLecons: 20,
    competences: competencesB([6, 7, 3, 0]),
    piecesManquantes: ['Justificatif de domicile', 'Attestation ASSR 2'],
    moniteursFavorisIds: ['m-benali'],
  },
  {
    id: 'e-riva',
    prenom: 'Tom',
    nom: 'Riva',
    telephone: '06 98 76 54 32',
    permis: 'B-AAC',
    forfaitLecons: 20,
    competences: competencesB([2, 0, 0, 0]),
    piecesManquantes: [],
    moniteursFavorisIds: ['m-roux'],
  },
  {
    id: 'e-haddad',
    prenom: 'Inès',
    nom: 'Haddad',
    telephone: '07 11 22 33 44',
    permis: 'B',
    forfaitLecons: 25,
    competences: competencesB([6, 7, 7, 4]),
    piecesManquantes: [],
    moniteursFavorisIds: ['m-benali', 'm-ortiz'],
  },
  {
    id: 'e-petit',
    prenom: 'Hugo',
    nom: 'Petit',
    telephone: '06 55 44 33 22',
    permis: 'B-auto',
    forfaitLecons: 13,
    competences: competencesB([6, 4, 0, 0]),
    piecesManquantes: ['Photo d’identité'],
    moniteursFavorisIds: [],
  },
  {
    id: 'e-benhamou',
    prenom: 'Sarah',
    nom: 'Benhamou',
    telephone: '06 77 88 99 00',
    permis: 'B-CS',
    forfaitLecons: 20,
    competences: competencesB([6, 7, 5, 0]),
    piecesManquantes: [],
    moniteursFavorisIds: ['m-benali'],
  },
  {
    id: 'e-nguyen',
    prenom: 'Julien',
    nom: 'Nguyen',
    telephone: '07 66 55 44 33',
    permis: 'A2',
    forfaitLecons: 20,
    competences: competencesB([4, 1, 0, 0]),
    piecesManquantes: ['Attestation ASSR 2', 'Pièce d’identité'],
    moniteursFavorisIds: ['m-ortiz'],
  },
];

const lieux: Record<string, Lieu> = {
  gare: { nom: 'Gare d’Aix-TGV', adresse: 'Route de la Gare, 13290 Aix-en-Provence' },
  zola: { nom: 'Lycée Zola', adresse: 'Avenue Arc de Meyran, 13100 Aix-en-Provence' },
  agence: { nom: 'Auto-école du Cours', adresse: '12 cours Mirabeau, 13100 Aix-en-Provence' },
  pontArc: { nom: 'Pont de l’Arc', adresse: 'Avenue de Toulon, 13090 Aix-en-Provence' },
};

/** Arrondit à l'heure suivante puis décale de `heures` heures et `jours` jours. */
function creneau(maintenant: Date, jours: number, heures: number, duree = 60) {
  const debut = new Date(maintenant);
  debut.setMinutes(0, 0, 0);
  debut.setHours(debut.getHours() + 1 + heures);
  debut.setDate(debut.getDate() + jours);
  const fin = new Date(debut.getTime() + duree * 60_000);
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

export function construireLecons(maintenant: Date): Lecon[] {
  return [
    {
      id: 'l-morel-14',
      numero: 14,
      eleveId: 'e-morel',
      moniteurId: 'm-benali',
      ...creneau(maintenant, 0, 0),
      lieuDepart: lieux.gare,
      lieuFin: lieux.zola,
      cours: { titre: 'Insertion sur voie rapide', envoyeLe: creneau(maintenant, -2, 0).debut, ouvertures: 0 },
    },
    {
      id: 'l-morel-15',
      numero: 15,
      eleveId: 'e-morel',
      moniteurId: 'm-benali',
      ...creneau(maintenant, 2, 1),
      lieuDepart: lieux.agence,
      lieuFin: lieux.agence,
      cours: { titre: 'Dépassement', envoyeLe: creneau(maintenant, 0, -3).debut, ouvertures: 1 },
    },
    {
      id: 'l-haddad-18',
      numero: 18,
      eleveId: 'e-haddad',
      moniteurId: 'm-benali',
      ...creneau(maintenant, 0, 2),
      lieuDepart: lieux.zola,
      lieuFin: lieux.pontArc,
    },
    {
      id: 'l-riva-3',
      numero: 3,
      eleveId: 'e-riva',
      moniteurId: 'm-roux',
      ...creneau(maintenant, 1, 0),
      lieuDepart: lieux.agence,
      lieuFin: lieux.agence,
    },
  ];
}

export const observations: Observation[] = [
  {
    id: 'o-1',
    eleveId: 'e-morel',
    auteurId: 'm-benali',
    date: '2026-11-08T15:10:00.000Z',
    texte: 'Bonne gestion des giratoires. Anticiper davantage les priorités à droite en ville.',
    visibleParEleve: true,
  },
  {
    id: 'o-2',
    eleveId: 'e-morel',
    auteurId: 'm-benali',
    date: '2026-11-08T15:12:00.000Z',
    texte: 'Un peu stressée à l’approche des voies rapides : prévoir un parcours progressif.',
    visibleParEleve: false,
  },
];

export const disponibilites: DisponibilitesMoniteur[] = [
  {
    moniteurId: 'm-benali',
    routine: [
      { jour: 1, debut: '08:00', fin: '12:00' },
      { jour: 1, debut: '13:00', fin: '16:00' },
      { jour: 2, debut: '08:00', fin: '16:00' },
      { jour: 3, debut: '08:00', fin: '12:00' },
      { jour: 4, debut: '08:00', fin: '16:00' },
      { jour: 5, debut: '08:00', fin: '16:00' },
    ],
    ouvertures: [{ id: 'ouv-1', date: '2026-11-21', debut: '09:00', fin: '12:00' }],
    absences: [{ id: 'abs-1', du: '2026-12-22', au: '2026-12-31', motif: 'conges' }],
  },
];

export const preferences: PreferencesEleve[] = [
  { eleveId: 'e-morel', creneaux: [{ jour: 6, debut: '09:00', fin: '12:00' }, { jour: 3, debut: '14:00', fin: '18:00' }], moniteursFavorisIds: ['m-benali'] },
  { eleveId: 'e-haddad', creneaux: [{ jour: 6, debut: '10:00', fin: '11:30' }], moniteursFavorisIds: ['m-benali', 'm-ortiz'] },
  { eleveId: 'e-benhamou', creneaux: [{ jour: 6, debut: '08:00', fin: '09:30' }], moniteursFavorisIds: ['m-benali'] },
  { eleveId: 'e-riva', creneaux: [{ jour: 6, debut: '09:00', fin: '12:00' }], moniteursFavorisIds: ['m-roux'] },
];
