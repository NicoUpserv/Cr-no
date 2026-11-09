import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Icone, type NomIcone } from './Icone';
import { Texte } from './Texte';

type Props = {
  titre: string;
  sousTitre?: string;
  /** Icône à gauche (catalogue `Icone`). */
  icone?: NomIcone;
  /** Élément à droite (cartouche, valeur…), avant le chevron. */
  aDroite?: ReactNode;
  /** Le sous-titre signale un point d'attention (texte en couleur danger). */
  sousTitreAlerte?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
};

/**
 * Cellule de liste native : retour visuel iOS (surbrillance) ou Android
 * (ondulation), chevron si l'action ouvre un écran.
 */
export function Ligne({ titre, sousTitre, icone, aDroite, sousTitreAlerte, onPress, accessibilityHint }: Props) {
  const { couleurs, espace, cibleTactile } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: couleurs.ondulation }}
      style={({ pressed }) => [
        styles.ligne,
        {
          minHeight: cibleTactile + espace.s,
          paddingHorizontal: espace.l,
          paddingVertical: espace.m,
          gap: espace.m,
          backgroundColor: pressed && Platform.OS === 'ios' ? couleurs.surfacePressee : couleurs.surface,
        },
      ]}>
      {icone ? <Icone nom={icone} taille={22} couleur={couleurs.teinte} /> : null}
      <View style={styles.textes}>
        <Texte variante="corps">{titre}</Texte>
        {sousTitre ? (
          <Texte variante="sousTitre" ton={sousTitreAlerte ? 'danger' : 'secondaire'}>
            {sousTitre}
          </Texte>
        ) : null}
      </View>
      {aDroite}
      {onPress ? <Icone nom="chevron" taille={14} couleur={couleurs.texteTertiaire} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textes: {
    flex: 1,
    gap: 2,
  },
});
