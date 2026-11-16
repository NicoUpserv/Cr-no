/**
 * Classement des fiches par zone de la voiture (poste de conduite, sous le capot, roues…),
 * pour réviser par endroit et pour les points interactifs de la voiture 3D.
 * Règles par mots-clés, testées sur les 100 fiches de la banque.
 */
import type { FicheVerification, ZoneVoiture } from './types';

export const libellesZones: Record<ZoneVoiture, string> = {
  poste: 'Poste de conduite (voyants et commandes)',
  habitacle: 'Habitacle et documents',
  moteur: 'Sous le capot',
  avant: 'Avant du véhicule',
  arriere: 'Arrière du véhicule',
  roues: 'Pneumatiques',
  coffre: 'Coffre',
  carrosserie: 'Tour du véhicule',
};

export const ORDRE_ZONES: ZoneVoiture[] = ['poste', 'habitacle', 'moteur', 'avant', 'carrosserie', 'roues', 'arriere', 'coffre'];

const contient = (texte: string, ...mots: string[]) => mots.some((m) => texte.includes(m));

export function zoneDeFiche(fiche: Pick<FicheVerification, 'type' | 'verification'>): ZoneVoiture {
  const t = fiche.verification.toLowerCase();
  if (fiche.type === 'VI') {
    if (contient(t, 'rétroviseur', 'appui-tête', 'airbag', 'isofix', 'gilet', 'certificat', 'assurance', 'éthylotest', 'constat')) return 'habitacle';
    return 'poste';
  }
  if (contient(t, 'pneumatique')) return 'roues';
  if (contient(t, 'capot', 'liquide', 'huile', 'batterie', 'remplissage du produit', 'orifice de remplissage')) return 'moteur';
  if (contient(t, 'coffre', 'triangle', 'ampoule à l’arrière', "ampoule à l'arrière")) return 'coffre';
  if (contient(t, 'gicleurs', 'ampoule à l’avant', "ampoule à l'avant", 'feux de croisement', 'feux de route', 'feux diurnes')) return 'avant';
  if (contient(t, 'brouillard arrière', 'feux de recul', 'feux de stop', 'plaque d’immatriculation à l’arrière', "plaque d'immatriculation à l'arrière")) return 'arriere';
  return 'carrosserie';
}

/** Fiche au hasard, comme le tirage de l'inspecteur (`aleatoire` injectable pour les tests). */
export function tirerFiche<T>(fiches: T[], aleatoire: () => number = Math.random): T | undefined {
  if (fiches.length === 0) return undefined;
  return fiches[Math.min(fiches.length - 1, Math.floor(aleatoire() * fiches.length))];
}
