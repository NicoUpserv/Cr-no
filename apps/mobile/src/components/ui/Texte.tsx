import { Text, type TextProps, type TextStyle } from 'react-native';

import type { Couleurs, VarianteTexte } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Ton = 'principal' | 'secondaire' | 'tertiaire' | 'teinte' | 'danger';

type Props = TextProps & {
  /** Style typographique (échelle de `theme/tokens.ts`). Par défaut : corps. */
  variante?: VarianteTexte;
  /** Couleur sémantique. Ignorée si `couleur` est fourni. */
  ton?: Ton;
  /** Couleur explicite issue des tokens (ex. `couleurs.panneauTexte`). */
  couleur?: Couleurs[keyof Couleurs];
  /** Chiffres tabulaires (heures, compteurs, soldes). */
  tabulaire?: boolean;
  /** Force une graisse plus forte que celle de la variante. */
  gras?: boolean;
};

const tonVersCouleur: Record<Ton, keyof Couleurs> = {
  principal: 'texte',
  secondaire: 'texteSecondaire',
  tertiaire: 'texteTertiaire',
  teinte: 'teinte',
  danger: 'danger',
};

/**
 * Seul composant de texte autorisé dans les écrans.
 * Respecte la taille de police système (Dynamic Type / échelle Android).
 */
export function Texte({ variante = 'corps', ton = 'principal', couleur, tabulaire, gras, style, ...props }: Props) {
  const { couleurs, typo } = useTheme();
  const base = typo[variante] as TextStyle;
  return (
    <Text
      {...props}
      style={[
        base,
        { color: couleur ?? couleurs[tonVersCouleur[ton]] },
        tabulaire && { fontVariant: ['tabular-nums'] },
        gras && !base.fontFamily && { fontWeight: '600' },
        style,
      ]}
    />
  );
}
