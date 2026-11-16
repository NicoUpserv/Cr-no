import { fichesVerification } from '@/data/verifications';

import { tirerFiche, zoneDeFiche } from './zones';

const zone = (numero: string) => zoneDeFiche(fichesVerification.find((f) => f.numero === numero)!);

describe('banque des vérifications', () => {
  it('contient 100 fiches numérotées de 00 à 99, 50 VI et 50 VE', () => {
    expect(fichesVerification).toHaveLength(100);
    expect(new Set(fichesVerification.map((f) => f.numero)).size).toBe(100);
    expect(fichesVerification.filter((f) => f.type === 'VI')).toHaveLength(50);
  });
  it('a toutes ses questions et réponses remplies', () => {
    for (const f of fichesVerification) {
      expect([f.verification, f.qser, f.qserReponse, f.secours, f.secoursReponse].every((t) => t.trim().length >= 3)).toBe(true);
    }
  });
});

describe('zoneDeFiche', () => {
  it('range les fiches au bon endroit de la voiture', () => {
    expect(zone('01')).toBe('poste'); // commande de réglage des feux
    expect(zone('03')).toBe('habitacle'); // rétroviseur position nuit
    expect(zone('02')).toBe('moteur'); // remplissage lave-glace
    expect(zone('04')).toBe('roues');
    expect(zone('00')).toBe('avant'); // gicleurs
    expect(zone('46')).toBe('arriere'); // feux de stop
    expect(zone('60')).toBe('coffre');
    expect(zone('06')).toBe('carrosserie'); // plaques
  });
  it('ne laisse aucune fiche intérieure hors de l’habitacle', () => {
    for (const f of fichesVerification.filter((x) => x.type === 'VI')) expect(['poste', 'habitacle']).toContain(zoneDeFiche(f));
  });
});

describe('tirerFiche', () => {
  it('tire une fiche dans la liste', () => {
    expect(tirerFiche(['a', 'b', 'c'], () => 0.5)).toBe('b');
    expect(tirerFiche(['a', 'b'], () => 0.9999)).toBe('b');
    expect(tirerFiche([], () => 0.5)).toBeUndefined();
  });
});
