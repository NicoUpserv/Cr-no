/**
 * Code couleur du planning (demande du client) : par véhicule (boîte manuelle, automatique, moto, remorque)
 * ou, pour la direction, par enseignant. La couleur n'est jamais le seul repère : le texte reste dans les blocs.
 */
import type { EntreeLegende } from '@/components/calendrier';
import { listerMoniteurs, trouverEleve } from '@/data/depot';
import { libellesVehicule, type Lecon, type Moniteur, type TypeVehicule } from '@/data/types';
import { indexCouleur, initiales, vehiculePourPermis } from '@/features/planning/vehicules';
import { useTheme } from '@/theme/use-theme';

const ORDRE_VEHICULES: TypeVehicule[] = ['manuelle', 'automatique', 'moto', 'remorque'];

export function useCouleursPlanning() {
  const { couleurs, calendrier } = useTheme();
  const ids = listerMoniteurs().map((m) => m.id);
  const vehiculeDe = (lecon: Lecon) => vehiculePourPermis(trouverEleve(lecon.eleveId)?.permis);
  const couleurEnseignant = (moniteurId: string) =>
    calendrier.enseignants[indexCouleur(ids, moniteurId, calendrier.enseignants.length)];

  return {
    vehiculeDe,
    couleurVehicule: (lecon: Lecon) => calendrier.vehicules[vehiculeDe(lecon)],
    couleurEnseignant,
    /** Légende des véhicules présents dans les leçons affichées, puis libre / annulée. */
    legendeVehicules: (lecons: Lecon[], options: { libres?: boolean; annulees?: boolean } = {}): EntreeLegende[] => {
      const presents = new Set(lecons.map(vehiculeDe));
      return [
        ...ORDRE_VEHICULES.filter((v) => presents.has(v)).map((v) => ({ libelle: libellesVehicule[v], couleur: calendrier.vehicules[v] })),
        ...communes(couleurs.attentionPictogramme, options),
      ];
    },
    legendeEnseignants: (moniteurs: Moniteur[], options: { annulees?: boolean } = {}): EntreeLegende[] => [
      ...moniteurs.map((m) => ({ libelle: `${initiales(m)} · ${m.prenom} ${m.nom}`, couleur: couleurEnseignant(m.id) })),
      ...communes(couleurs.attentionPictogramme, options),
    ],
  };
}

function communes(jaune: string, { libres, annulees }: { libres?: boolean; annulees?: boolean }): EntreeLegende[] {
  return [
    ...(libres ? [{ libelle: 'Créneau libre', couleur: jaune, style: 'pointille' as const }] : []),
    ...(annulees ? [{ libelle: 'Leçon annulée (créneau de nouveau libre)', couleur: jaune }] : []),
  ];
}
