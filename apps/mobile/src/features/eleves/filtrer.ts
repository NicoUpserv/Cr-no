import type { Eleve, TypePermis } from '@/data/types';

export type FiltreEleves = {
  recherche: string;
  seulementDossierIncomplet: boolean;
  permis: TypePermis | 'tous';
};

const collateurFrancais = new Intl.Collator('fr', { sensitivity: 'base' });

/** Minuscules, sans accents ni espaces en début et en fin. */
function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Trie par nom puis prénom, dans l'ordre alphabétique français. */
function comparerEleves(a: Eleve, b: Eleve): number {
  return collateurFrancais.compare(a.nom, b.nom) || collateurFrancais.compare(a.prenom, b.prenom);
}

/**
 * Filtre la liste des élèves selon la recherche, le dossier et le permis.
 * Ne modifie jamais le tableau reçu.
 */
export function filtrerEleves(eleves: Eleve[], filtre: FiltreEleves): Eleve[] {
  const recherche = normaliser(filtre.recherche);

  return eleves
    .filter((eleve) => {
      if (filtre.seulementDossierIncomplet && eleve.piecesManquantes.length === 0) return false;
      if (filtre.permis !== 'tous' && eleve.permis !== filtre.permis) return false;
      if (!recherche) return true;

      return [eleve.prenom, eleve.nom, `${eleve.prenom} ${eleve.nom}`].some((champ) =>
        normaliser(champ).includes(recherche),
      );
    })
    .sort(comparerEleves);
}
