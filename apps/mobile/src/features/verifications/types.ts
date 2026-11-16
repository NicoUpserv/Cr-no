/** Fiche officielle de vérification de l'examen pratique (banque DSR). */
export type FicheVerification = {
  /** « 00 » à « 99 » : numéro tiré par l'inspecteur. */
  numero: string;
  /** VI : vérification intérieure ; VE : vérification extérieure. */
  type: 'VI' | 'VE';
  verification: string;
  /** Précision de la banque officielle (ce qui est attendu du candidat). */
  precision?: string;
  /** Question en lien avec la sécurité routière. */
  qser: string;
  qserReponse: string;
  /** Question de premiers secours. */
  secours: string;
  secoursReponse: string;
};

/** Zones de la voiture : regroupent les fiches et servent de points interactifs sur la voiture 3D. */
export type ZoneVoiture = 'poste' | 'habitacle' | 'moteur' | 'avant' | 'arriere' | 'roues' | 'coffre' | 'carrosserie';

/** Vidéo d'explication tournée sur la voiture 3D, liée aux fiches qu'elle couvre. */
export type VideoVerification = {
  id: string;
  titre: string;
  /** Numéros des fiches expliquées. */
  fiches: string[];
  /** `require(...)` en démo, URL de streaming en production. */
  source: number | string;
};
