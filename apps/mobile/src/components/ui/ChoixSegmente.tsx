/**
 * Sélecteur segmenté (« Jour | Semaine | Mois | Année ») : bascule entre quelques vues d'un même écran.
 * Natif sur iOS (SwiftUI) et Android (Material 3) — voir `.ios.tsx` / `.android.tsx` ;
 * cette version sert au web, sans composant natif équivalent.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import type { PropsChoixSegmente } from './ChoixSegmente.types';
import { Texte } from './Texte';

export function ChoixSegmente<T extends string>({ valeur, options, onChange, accessibilityLabel }: PropsChoixSegmente<T>) {
  const { couleurs, espace, rayon, cibleTactile } = useTheme();
  return (
    <View style={{ paddingHorizontal: espace.l, paddingTop: espace.m }}>
      <View
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel}
        style={[styles.rangee, { backgroundColor: couleurs.surfacePressee, borderRadius: rayon.cartouche + 4, padding: 2 }]}>
        {options.map((o) => {
          const actif = o.valeur === valeur;
          return (
            <Pressable
              key={o.valeur}
              onPress={() => onChange(o.valeur)}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              style={[
                styles.segment,
                {
                  minHeight: cibleTactile - 12,
                  borderRadius: rayon.cartouche + 2,
                  backgroundColor: actif ? couleurs.surface : 'transparent',
                },
              ]}>
              <Texte variante="sousTitre" ton={actif ? 'principal' : 'secondaire'} gras={actif}>
                {o.libelle}
              </Texte>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rangee: { flexDirection: 'row' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
