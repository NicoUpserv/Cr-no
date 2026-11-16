import { calendrierRelances, texteRelance } from './relances';

describe('calendrierRelances', () => {
  it('liste les relances passées et la prochaine', () => {
    const r = calendrierRelances('2026-11-01', new Date(2026, 10, 9, 10));
    expect(r.envoyees).toEqual(['2026-11-04', '2026-11-08']);
    expect(r.prochaine).toBe('2026-11-15');
  });
  it('n’a plus de prochaine relance après J+14', () => {
    expect(calendrierRelances('2026-11-01', new Date(2026, 10, 20, 10)).prochaine).toBeUndefined();
  });
  it('n’a rien envoyé le jour de l’inscription', () => {
    expect(calendrierRelances('2026-11-01', new Date(2026, 10, 1, 18)).envoyees).toEqual([]);
  });
});

describe('texteRelance', () => {
  it('accorde au singulier et au pluriel', () => {
    expect(texteRelance('Hugo', ['Photo d’identité'])).toBe(
      'Bonjour Hugo, il manque encore une pièce à ton dossier : photo d’identité. Envoie-la depuis Mes infos (une photo lisible suffit).',
    );
    expect(texteRelance('Lina', ['Justificatif de domicile', 'Attestation ASSR 2'])).toContain('des pièces à ton dossier : justificatif de domicile, attestation ASSR 2. Envoie-les');
  });
});
