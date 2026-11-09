import { useColorScheme } from 'react-native';

import { cibleTactile, espace, palettes, rayon, typo, type Couleurs } from './tokens';

export type Theme = {
  sombre: boolean;
  couleurs: Couleurs;
  espace: typeof espace;
  rayon: typeof rayon;
  typo: typeof typo;
  cibleTactile: number;
};

/**
 * Point d'entrée unique vers les tokens.
 * Plus tard : la teinte de l'auto-école remplacera `couleurs.teinte`.
 */
export function useTheme(): Theme {
  const sombre = useColorScheme() === 'dark';
  return {
    sombre,
    couleurs: sombre ? palettes.sombre : palettes.clair,
    espace,
    rayon,
    typo,
    cibleTactile,
  };
}
