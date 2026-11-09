import type { Eleve } from '@/data/types';

import { filtrerEleves, type FiltreEleves } from './filtrer';

function creerEleve(infos: Pick<Eleve, 'id' | 'prenom' | 'nom'> & Partial<Eleve>): Eleve {
  return {
    telephone: '06 00 00 00 00',
    permis: 'B',
    forfaitLecons: 20,
    competences: [],
    piecesManquantes: [],
    moniteursFavorisIds: [],
    ...infos,
  };
}

const sansFiltre: FiltreEleves = {
  recherche: '',
  seulementDossierIncomplet: false,
  permis: 'tous',
};

const eleves: Eleve[] = [
  creerEleve({ id: '1', prenom: 'Zoé', nom: 'Durand' }),
  creerEleve({ id: '2', prenom: 'Émile', nom: 'Bernard', piecesManquantes: ['photo'] }),
  creerEleve({ id: '3', prenom: 'Jean', nom: 'Dupont', permis: 'B-AAC' }),
  creerEleve({ id: '4', prenom: 'Alice', nom: 'Bernard' }),
];

describe('filtrerEleves', () => {
  it('trie par nom puis prénom sans tenir compte des accents', () => {
    expect(filtrerEleves(eleves, sansFiltre).map((e) => e.id)).toEqual(['4', '2', '3', '1']);
  });

  it('range « Émile » avec les « E »', () => {
    const avecAccents = [
      creerEleve({ id: 'e1', prenom: 'Émile', nom: 'Martin' }),
      creerEleve({ id: 'e2', prenom: 'Eric', nom: 'Martin' }),
      creerEleve({ id: 'e3', prenom: 'Anna', nom: 'Martin' }),
    ];

    expect(filtrerEleves(avecAccents, sansFiltre).map((e) => e.id)).toEqual(['e3', 'e1', 'e2']);
  });

  it('cherche par prénom sans tenir compte de la casse, des accents et des espaces', () => {
    expect(
      filtrerEleves(eleves, { ...sansFiltre, recherche: '  EMILE ' }).map((e) => e.id),
    ).toEqual(['2']);
  });

  it('cherche par nom', () => {
    expect(filtrerEleves(eleves, { ...sansFiltre, recherche: 'durand' }).map((e) => e.id)).toEqual([
      '1',
    ]);
  });

  it('cherche sur « prénom nom »', () => {
    expect(
      filtrerEleves(eleves, { ...sansFiltre, recherche: 'jean dupont' }).map((e) => e.id),
    ).toEqual(['3']);
  });

  it('ne filtre pas quand la recherche est vide', () => {
    expect(filtrerEleves(eleves, { ...sansFiltre, recherche: '   ' })).toHaveLength(eleves.length);
  });

  it('ne garde que les dossiers incomplets', () => {
    expect(
      filtrerEleves(eleves, { ...sansFiltre, seulementDossierIncomplet: true }).map((e) => e.id),
    ).toEqual(['2']);
  });

  it('ne garde que les élèves du permis demandé', () => {
    expect(filtrerEleves(eleves, { ...sansFiltre, permis: 'B-AAC' }).map((e) => e.id)).toEqual([
      '3',
    ]);
  });

  it('combine la recherche et le dossier incomplet', () => {
    expect(
      filtrerEleves(eleves, {
        ...sansFiltre,
        recherche: 'bernard',
        seulementDossierIncomplet: true,
      }).map((e) => e.id),
    ).toEqual(['2']);
  });

  it('renvoie une liste vide quand aucun élève ne correspond', () => {
    expect(filtrerEleves(eleves, { ...sansFiltre, recherche: 'introuvable' })).toEqual([]);
  });

  it('ne modifie pas le tableau reçu', () => {
    const ordreInitial = eleves.map((e) => e.id);
    const resultat = filtrerEleves(eleves, sansFiltre);

    expect(eleves.map((e) => e.id)).toEqual(ordreInitial);
    expect(resultat).not.toBe(eleves);
  });
});
