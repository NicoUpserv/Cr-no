import type { DisponibilitesMoniteur, Lecon } from '@/data/types';

import { absenceLe, creneauxLibres, joursAVenir, numeroterLecons, peutAnnuler, plagesDuJour } from './creneaux';

// Lundi 16 novembre 2026, 07:30 (heure locale).
const maintenant = new Date(2026, 10, 16, 7, 30);
const lundi = '2026-11-16';
const samedi = '2026-11-21';

const dispos: DisponibilitesMoniteur = {
  moniteurId: 'm1',
  routine: [
    { jour: 1, debut: '08:00', fin: '12:00' },
    { jour: 1, debut: '14:00', fin: '16:30' },
  ],
  ouvertures: [{ id: 'o1', date: samedi, debut: '09:00', fin: '11:00' }],
  absences: [{ id: 'a1', du: '2026-11-23', au: '2026-11-27', motif: 'conges' }],
};

const lieu = { nom: 'Agence', adresse: '1 rue' };
function lecon(id: string, eleveId: string, debut: Date, numero = 0, moniteurId = 'm1'): Lecon {
  return {
    id,
    numero,
    eleveId,
    moniteurId,
    debut: debut.toISOString(),
    fin: new Date(debut.getTime() + 3_600_000).toISOString(),
    lieuDepart: lieu,
    lieuFin: lieu,
  };
}
const heures = (creneaux: { debut: string }[]) => creneaux.map((c) => new Date(c.debut).getHours());

describe('créneaux libres', () => {
  it('découpe les horaires habituels en leçons d’une heure entière', () => {
    // 08-12 → 4 leçons ; 14-16:30 → 2 leçons (la demi-heure restante ne suffit pas).
    expect(heures(creneauxLibres(dispos, [], lundi, maintenant))).toEqual([8, 9, 10, 11, 14, 15]);
  });

  it('retire les créneaux déjà pris par une leçon de cet enseignant', () => {
    const prises = [lecon('l1', 'e1', new Date(2026, 10, 16, 9, 0)), lecon('l2', 'e2', new Date(2026, 10, 16, 14, 30))];
    expect(heures(creneauxLibres(dispos, prises, lundi, maintenant))).toEqual([8, 10, 11]);
  });

  it('ignore les leçons des autres enseignants', () => {
    const autre = [lecon('l1', 'e1', new Date(2026, 10, 16, 9, 0), 0, 'm2')];
    expect(creneauxLibres(dispos, autre, lundi, maintenant)).toHaveLength(6);
  });

  it('ne propose pas de créneau déjà commencé ou passé', () => {
    const midi = new Date(2026, 10, 16, 10, 0);
    expect(heures(creneauxLibres(dispos, [], lundi, midi))).toEqual([11, 14, 15]);
  });

  it('ajoute les ouvertures ponctuelles', () => {
    expect(heures(creneauxLibres(dispos, [], samedi, maintenant))).toEqual([9, 10]);
  });

  it('ne propose rien pendant une absence', () => {
    expect(absenceLe(dispos, '2026-11-23')?.motif).toBe('conges');
    expect(plagesDuJour(dispos, '2026-11-23')).toEqual([]);
  });

  it('liste les prochains jours à partir d’aujourd’hui', () => {
    expect(joursAVenir(maintenant, 3)).toEqual(['2026-11-16', '2026-11-17', '2026-11-18']);
  });
});

describe('annulation', () => {
  const dans = (h: number) => ({ debut: new Date(maintenant.getTime() + h * 3_600_000).toISOString() });

  it('l’élève peut annuler jusqu’à 48 h avant, pas après', () => {
    expect(peutAnnuler(dans(48), 'eleve', maintenant)).toBe(true);
    expect(peutAnnuler(dans(47), 'eleve', maintenant)).toBe(false);
  });

  it('l’enseignant ne peut jamais retirer un élève', () => {
    expect(peutAnnuler(dans(200), 'enseignant', maintenant)).toBe(false);
  });

  it('la direction peut annuler tant que la leçon n’a pas commencé', () => {
    expect(peutAnnuler(dans(1), 'direction', maintenant)).toBe(true);
    expect(peutAnnuler(dans(-1), 'direction', maintenant)).toBe(false);
  });
});

describe('numérotation des leçons', () => {
  it('insère une leçon réservée à sa place chronologique', () => {
    const l14 = lecon('a', 'e1', new Date(2026, 10, 16, 9), 14);
    const l15 = lecon('b', 'e1', new Date(2026, 10, 20, 9), 15);
    const nouvelle = lecon('n', 'e1', new Date(2026, 10, 18, 9), 0);
    const numeros = Object.fromEntries(numeroterLecons([l14, l15, nouvelle]).map((l) => [l.id, l.numero]));
    expect(numeros).toEqual({ a: 14, n: 15, b: 16 });
  });

  it('commence à L1 pour un élève sans leçon', () => {
    expect(numeroterLecons([lecon('n', 'e9', maintenant, 0)])[0].numero).toBe(1);
  });
});
