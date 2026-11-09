import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Texte } from './Texte';

type Props = {
  /** Numéro de la leçon dans la séquence de l'élève. */
  numero: number;
};

/**
 * Cartouche de numéro de leçon (« L14 »), inspiré des numéros de route
 * des cartes routières. À utiliser partout où une leçon est désignée.
 */
export function Cartouche({ numero }: Props) {
  const { couleurs, rayon, espace } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`Leçon ${numero}`}
      style={[
        styles.cartouche,
        {
          backgroundColor: couleurs.cartoucheFond,
          borderColor: couleurs.cartoucheBord,
          borderRadius: rayon.cartouche,
          paddingHorizontal: espace.xs + 2,
        },
      ]}>
      <Texte variante="chiffre" couleur={couleurs.cartoucheTexte}>
        L{numero}
      </Texte>
    </View>
  );
}

const styles = StyleSheet.create({
  cartouche: {
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    minWidth: 36,
    alignItems: 'center',
  },
});
