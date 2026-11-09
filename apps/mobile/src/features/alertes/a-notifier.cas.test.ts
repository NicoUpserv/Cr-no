import type { JourSemaine, Lecon, PreferencesEleve } from '@/data/types';

import { elevesANotifier } from './a-notifier';

/** Date locale → ISO, pour fabriquer des leçons. */
const iso = (a: number, m: number, j: number, h: number, min = 0) =>
  new Date(a, m - 1, j, h, min).toISOString();

const lieu = { nom: 'Agence', adresse: 'Aix' };

const lecon = (eleveId: string, debut: string, fin: string, moniteurId = 'm-autre'): Lecon => ({
  id: `l-${eleveId}-${debut}`,
  numero: 1,
  eleveId,
  moniteurId,
  debut,
  fin,
  lieuDepart: lieu,
  lieuFin: lieu,
});

const preference = (
  eleveId: string,
  creneaux: { jour: JourSemaine; debut: string; fin: string }[],
  moniteursFavorisIds = ['m-benali'],
): PreferencesEleve => ({ eleveId, creneaux, moniteursFavorisIds });

// Samedi 21 novembre 2026 (jour ISO 6)
const ouverture = { id: 'o1', date: '2026-11-21', debut: '09:00', fin: '12:00' };
const maintenant = new Date(2026, 10, 18, 10, 0); // mercredi 18 novembre, 10:00

describe('elevesANotifier — cas limites', () => {
  it('découpe l’ouverture autour de la routine et garde le morceau du matin', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [{ jour: 6, debut: '10:00', fin: '11:00' }],
      preferences: [preference('e-morel', [{ jour: 6, debut: '09:00', fin: '12:00' }])],
      lecons: [],
      maintenant,
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '10:00' }]);
  });

  it('ignore la routine d’un autre jour de la semaine', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [{ jour: 1, debut: '09:00', fin: '12:00' }],
      preferences: [preference('e-morel', [{ jour: 6, debut: '09:00', fin: '12:00' }])],
      lecons: [],
      maintenant,
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '12:00' }]);
  });

  it('retire la partie déjà passée, à la minute près', () => {
    const mercredi = { id: 'o2', date: '2026-11-18', debut: '09:00', fin: '12:00' };
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture: mercredi,
      routine: [],
      preferences: [preference('e-morel', [{ jour: 3, debut: '09:00', fin: '12:00' }])],
      lecons: [],
      maintenant: new Date(2026, 10, 18, 10, 30, 45),
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-18', debut: '10:30', fin: '12:00' }]);
  });

  it('ne renvoie rien quand l’ouverture est entièrement passée', () => {
    const mercredi = { id: 'o2', date: '2026-11-18', debut: '09:00', fin: '12:00' };
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture: mercredi,
      routine: [],
      preferences: [preference('e-morel', [{ jour: 3, debut: '09:00', fin: '12:00' }])],
      lecons: [],
      maintenant: new Date(2026, 10, 18, 13, 0),
    });

    expect(resultat).toEqual([]);
  });

  it('respecte une durée minimale personnalisée', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences: [preference('e-benhamou', [{ jour: 6, debut: '08:00', fin: '09:30' }])],
      lecons: [],
      maintenant,
      dureeMinimale: 30,
    });

    expect(resultat).toEqual([
      { eleveId: 'e-benhamou', date: '2026-11-21', debut: '09:00', fin: '09:30' },
    ]);
  });

  it('passe à la fenêtre suivante quand la première chevauche une leçon', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences: [
        preference('e-morel', [
          { jour: 6, debut: '09:00', fin: '10:00' },
          { jour: 6, debut: '10:30', fin: '12:00' },
        ]),
      ],
      lecons: [lecon('e-morel', iso(2026, 11, 21, 9, 30), iso(2026, 11, 21, 10, 30))],
      maintenant,
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '10:30', fin: '12:00' }]);
  });

  it('ne bloque pas une fenêtre qu’une leçon touche sans la chevaucher', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences: [preference('e-morel', [{ jour: 6, debut: '09:00', fin: '12:00' }])],
      lecons: [lecon('e-morel', iso(2026, 11, 21, 12), iso(2026, 11, 21, 13))],
      maintenant,
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '12:00' }]);
  });

  it('garde une seule alerte par élève, la plus tôt', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences: [
        preference('e-morel', [
          { jour: 6, debut: '10:00', fin: '11:00' },
          { jour: 6, debut: '09:00', fin: '10:00' },
        ]),
      ],
      lecons: [],
      maintenant,
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '10:00' }]);
  });

  it('trie par début croissant puis par identifiant d’élève', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences: [
        preference('e-zola', [{ jour: 6, debut: '09:00', fin: '12:00' }]),
        preference('e-alpha', [{ jour: 6, debut: '09:00', fin: '12:00' }]),
        preference('e-morel', [{ jour: 6, debut: '10:00', fin: '12:00' }]),
      ],
      lecons: [],
      maintenant,
    });

    expect(resultat.map((r) => r.eleveId)).toEqual(['e-alpha', 'e-zola', 'e-morel']);
  });

  it('ignore la leçon d’un autre élève', () => {
    const resultat = elevesANotifier({
      moniteurId: 'm-benali',
      ouverture,
      routine: [],
      preferences: [preference('e-morel', [{ jour: 6, debut: '09:00', fin: '12:00' }])],
      lecons: [lecon('e-riva', iso(2026, 11, 21, 9), iso(2026, 11, 21, 12))],
      maintenant,
    });

    expect(resultat).toEqual([{ eleveId: 'e-morel', date: '2026-11-21', debut: '09:00', fin: '12:00' }]);
  });
});
