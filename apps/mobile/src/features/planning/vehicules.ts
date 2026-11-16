/** Véhicule d'une leçon, déduit du permis préparé par l'élève (code couleur du planning). */
import type { TypePermis, TypeVehicule } from '@/data/types';

const parPermis: Record<TypePermis, TypeVehicule> = {
  B: 'manuelle',
  'B-AAC': 'manuelle',
  'B-CS': 'manuelle',
  'B-auto': 'automatique',
  AM: 'moto',
  A1: 'moto',
  A2: 'moto',
  BE: 'remorque',
};

export function vehiculePourPermis(permis: TypePermis | undefined): TypeVehicule {
  return permis ? parPermis[permis] : 'manuelle';
}

/** Initiales de l'enseignant (« KB ») : repère texte en plus de la couleur. */
export function initiales(personne: { prenom: string; nom: string } | undefined): string {
  return personne ? `${personne.prenom.charAt(0)}${personne.nom.charAt(0)}`.toUpperCase() : '';
}

/** Index de couleur d'un enseignant : son rang dans l'équipe, en boucle sur la palette. */
export function indexCouleur(ids: string[], id: string, taillePalette: number): number {
  const i = ids.indexOf(id);
  return (i < 0 ? 0 : i) % taillePalette;
}
