import { formatDans, formatHeure, formatJour, formatPiecesManquantes } from './format';

const maintenant = new Date(2026, 10, 9, 13, 25); // lundi 9 novembre 2026, 13:25

describe('format', () => {
  it('formate une heure sur deux chiffres', () => {
    expect(formatHeure(new Date(2026, 10, 9, 8, 5))).toBe('08:05');
  });

  it('nomme les jours proches', () => {
    expect(formatJour(new Date(2026, 10, 9, 18, 0), maintenant)).toBe('Aujourd’hui');
    expect(formatJour(new Date(2026, 10, 10, 9, 0), maintenant)).toBe('Demain');
    expect(formatJour(new Date(2026, 10, 12, 9, 0), maintenant)).toBe('jeu. 12 nov.');
  });

  it('dit dans combien de temps commence une leçon', () => {
    expect(formatDans(new Date(2026, 10, 9, 14, 0), new Date(2026, 10, 9, 15, 0), maintenant)).toBe('dans 35 min');
    expect(formatDans(new Date(2026, 10, 9, 13, 0), new Date(2026, 10, 9, 14, 0), maintenant)).toBe('en cours');
    expect(formatDans(new Date(2026, 10, 12, 13, 25), new Date(2026, 10, 12, 14, 25), maintenant)).toBe('dans 3 jours');
  });

  it('accorde le nombre de pièces manquantes', () => {
    expect(formatPiecesManquantes(0)).toBe('Dossier complet');
    expect(formatPiecesManquantes(1)).toBe('1 document manquant');
    expect(formatPiecesManquantes(2)).toBe('2 documents manquants');
  });
});
