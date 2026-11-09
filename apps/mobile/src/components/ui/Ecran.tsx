import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useTheme } from '@/theme/use-theme';

type Props = {
  children: ReactNode;
};

/**
 * Conteneur standard d'un écran : défilement natif, marges de sécurité gérées
 * par la barre de navigation (grand titre iOS qui se replie au défilement).
 */
export function Ecran({ children }: Props) {
  const { couleurs, espace } = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: couleurs.fond }}
      contentContainerStyle={[styles.contenu, { paddingBottom: espace.xxxl, gap: espace.xs }]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: {
    flexGrow: 1,
  },
});
