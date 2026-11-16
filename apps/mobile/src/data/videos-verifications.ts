/**
 * Vidéos de démonstration des vérifications, tournées image par image sur la voiture 3D générique
 * (public/voiture-3d, mode « video ») avec une voix de synthèse. À remplacer ou compléter par des
 * vidéos tournées sur la voiture de l'auto-école.
 */
import type { VideoVerification } from '@/features/verifications/types';

export const videosVerification: VideoVerification[] = [
  {
    id: 'capot',
    titre: 'Sous le capot : repérer les niveaux',
    fiches: ['48', '64', '22', '80', '36', '12', '72', '08', '70', '02', '50', '24'],
    source: require('../../assets/demo/verif-capot.mp4'),
  },
  {
    id: 'pneus',
    titre: 'Les pneumatiques : flanc, usure, pression',
    fiches: ['04', '68', '32', '84', '38', '86', '63', '99'],
    source: require('../../assets/demo/verif-pneus.mp4'),
  },
];
