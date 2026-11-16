import { indexCouleur, initiales, vehiculePourPermis } from './vehicules';

describe('vehiculePourPermis', () => {
  it('associe chaque permis à son véhicule', () => {
    expect(vehiculePourPermis('B')).toBe('manuelle');
    expect(vehiculePourPermis('B-AAC')).toBe('manuelle');
    expect(vehiculePourPermis('B-auto')).toBe('automatique');
    expect(vehiculePourPermis('A2')).toBe('moto');
    expect(vehiculePourPermis('BE')).toBe('remorque');
    expect(vehiculePourPermis(undefined)).toBe('manuelle');
  });
});

describe('initiales et couleurs', () => {
  it('donne les initiales en majuscules', () => {
    expect(initiales({ prenom: 'karim', nom: 'Benali' })).toBe('KB');
    expect(initiales(undefined)).toBe('');
  });
  it('attribue les couleurs dans l’ordre de l’équipe, en boucle', () => {
    const ids = ['a', 'b', 'c'];
    expect(indexCouleur(ids, 'b', 8)).toBe(1);
    expect(indexCouleur(ids, 'c', 2)).toBe(0);
    expect(indexCouleur(ids, 'inconnu', 8)).toBe(0);
  });
});
