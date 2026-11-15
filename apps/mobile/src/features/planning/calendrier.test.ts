import {
  compterParJour,
  contientAujourdhui,
  debutSemaine,
  decaler,
  grilleMois,
  joursSemaine,
  positionDansJournee,
  repartirEnColonnes,
  titrePeriode,
} from './calendrier';

const iso = (j: number, h: number, m = 0) => new Date(2026, 10, j, h, m).toISOString();

describe('calendrier : semaines et mois', () => {
  it('commence la semaine le lundi', () => {
    expect(debutSemaine('2026-11-18')).toBe('2026-11-16'); // mercredi → lundi
    expect(debutSemaine('2026-11-22')).toBe('2026-11-16'); // dimanche → lundi précédent
    expect(joursSemaine('2026-11-18')).toEqual([
      '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22',
    ]);
  });

  it('construit la grille de novembre 2026 en semaines complètes', () => {
    const grille = grilleMois(2026, 10);
    // Le 1er novembre 2026 est un dimanche : la grille commence le lundi 26 octobre.
    expect(grille[0][0]).toEqual({ date: '2026-10-26', dansLeMois: false });
    expect(grille[0][6]).toEqual({ date: '2026-11-01', dansLeMois: true });
    expect(grille[grille.length - 1][0].date).toBe('2026-11-30');
    expect(grille.every((s) => s.length === 7)).toBe(true);
  });

  it('avance et recule d’une période', () => {
    expect(decaler('2026-11-30', 'jour', 1)).toBe('2026-12-01');
    expect(decaler('2026-11-18', 'semaine', -1)).toBe('2026-11-11');
    expect(decaler('2026-01-31', 'mois', 1)).toBe('2026-02-01');
    expect(decaler('2026-11-18', 'annee', 1)).toBe('2027-01-01');
  });

  it('titre chaque période en français', () => {
    expect(titrePeriode('2026-11-16', 'jour')).toBe('lundi 16 novembre');
    expect(titrePeriode('2026-11-18', 'semaine')).toBe('16 – 22 nov.');
    expect(titrePeriode('2026-11-30', 'semaine')).toBe('30 nov. – 6 déc.');
    expect(titrePeriode('2026-11-18', 'mois')).toBe('novembre 2026');
    expect(titrePeriode('2026-11-18', 'annee')).toBe('2026');
  });

  it('sait si la période affichée contient aujourd’hui', () => {
    const maintenant = new Date(2026, 10, 18, 10);
    expect(contientAujourdhui('2026-11-16', 'semaine', maintenant)).toBe(true);
    expect(contientAujourdhui('2026-11-25', 'semaine', maintenant)).toBe(false);
    expect(contientAujourdhui('2026-11-01', 'mois', maintenant)).toBe(true);
  });
});

describe('calendrier : placement des créneaux', () => {
  it('compte les leçons par jour', () => {
    const compte = compterParJour([{ debut: iso(16, 9) }, { debut: iso(16, 14) }, { debut: iso(17, 9) }]);
    expect(compte.get('2026-11-16')).toBe(2);
    expect(compte.get('2026-11-17')).toBe(1);
  });

  it('place un créneau dans la journée affichée (7 h – 21 h)', () => {
    const p = positionDansJournee(iso(16, 14), iso(16, 15));
    expect(p.haut).toBeCloseTo(0.5);
    expect(p.hauteur).toBeCloseTo(1 / 14);
  });

  it('borne un créneau qui déborde de la journée affichée', () => {
    const p = positionDansJournee(iso(16, 22), iso(16, 23));
    expect(p.haut).toBe(1);
    expect(p.hauteur).toBe(0);
  });

  it('met côte à côte les créneaux qui se chevauchent', () => {
    const a = { id: 'a', debut: iso(16, 9), fin: iso(16, 10) };
    const b = { id: 'b', debut: iso(16, 9, 30), fin: iso(16, 10, 30) };
    const c = { id: 'c', debut: iso(16, 14), fin: iso(16, 15) };
    const r = Object.fromEntries(repartirEnColonnes([c, b, a]).map((x) => [x.element.id, [x.colonne, x.colonnes]]));
    expect(r).toEqual({ a: [0, 2], b: [1, 2], c: [0, 1] });
  });
});
