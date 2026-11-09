import type { Lecon, PreferencesEleve } from '@/data/types';

import { elevesANotifier } from './a-notifier';

/** Date locale → ISO, pour fabriquer des leçons. */
const iso = (a: number, m: number, j: number, h: number, min = 0) => new Date(a, m - 1, j, h, min).toISOString();

const lieu = { nom: 'Agence', adresse: 'Aix' };
const lecon = (eleveId: string, debut: string, fin: string): Lecon => ({
  id: `l-${eleveId}`,
  numero: 1,
  eleveId,
  moniteurId: 'm-autre',
  debut,
  fin,
  lieuDepart: lieu,
  lieuFin: lieu,
});

// Samedi 21 novembre 2026 (jour ISO 6)
const ouverture = { id: 'o1', date: '2026-11-21', debut: '09:00', fin: '12:00' };
const maintenant = new Date(2026, 10, 18, 10, 0); // mercredi 18 novembre, 10:00

const preferences: PreferencesEleve[] = [
  { eleveId: 'e-morel', creneaux: [{ jour: 6, debut: '09:00', fin: '12:00' }], moniteursFavorisIds: ['m-benali'] },
  { eleveId: 'e-benhamou', creneaux: [{ jour: 6, debut: '08:00', fin: '09:30' }], moniteursFavorisIds: ['m-benali'] },
  { eleveId: 'e-riva', creneaux: [{ jour: 6, debut: '09:00', fin: '12:00' }], moniteursFavorisIds: ['m-roux'] },
];

describe('elevesANotifier — tests de base', () => {
  it("propose la fenêtre commune à l'élève qui a l'enseignant en favori", () => {
    const resultat = elevesANotifier({ moniteurId: 'm-benali', ouverture, routine: [], preferences, lecons: [], maintenant });
    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '12:00' }]);
  });

  it("n'alerte pas un élève dont la fenêtre commune fait moins d'une heure", () => {
    const resultat = elevesANotifier({ moniteurId: 'm-benali', ouverture, routine: [], preferences, lecons: [], maintenant });
    expect(resultat.map((r) => r.eleveId)).not.toContain('e-benhamou');
  });

  it("n'alerte pas un élève qui n'a pas l'enseignant en favori", () => {
    const resultat = elevesANotifier({ moniteurId: 'm-benali', ouverture, routine: [], preferences, lecons: [], maintenant });
    expect(resultat.map((r) => r.eleveId)).not.toContain('e-riva');
  });

  it('ne renvoie rien si l’ouverture est entièrement dans la routine', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [{ jour: 6, debut: '08:00', fin: '13:00' }],
      preferences,
      lecons: [],
      maintenant,
    });
    expect(resultat).toEqual([]);
  });

  it("écarte un élève qui a déjà une leçon sur la fenêtre", () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences,
      lecons: [lecon('e-morel', iso(2026, 11, 21, 9), iso(2026, 11, 21, 12))],
      maintenant,
    });
    expect(resultat).toEqual([]);
  });
});
