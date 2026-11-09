import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Texte } from './Texte';

type Props = {
  /** En-tête de section natif (« Dossier », « Prochaine leçon »…). */
  titre?: string;
  /** Texte d'aide sous le groupe. */
  pied?: string;
  /**
   * `groupe` : cellules blanches arrondies avec séparateurs (listes iOS / Material).
   * `libre` : le contenu est posé tel quel (panneau, bande de progression…).
   */
  forme?: 'groupe' | 'libre';
  children: ReactNode;
};

/** Section d'écran à la manière des listes groupées natives. */
export function Section({ titre, pied, forme = 'groupe', children }: Props) {
  const { couleurs, espace, rayon } = useTheme();
  const enfants = Children.toArray(children);

  return (
    <View style={{ paddingHorizontal: espace.l, paddingTop: espace.xl }}>
      {titre ? (
        <Texte
          variante="section"
          ton="secondaire"
          accessibilityRole="header"
          style={{ paddingHorizontal: espace.l, paddingBottom: espace.s }}>
          {titre}
        </Texte>
      ) : null}

      {forme === 'groupe' ? (
        <View style={[styles.groupe, { backgroundColor: couleurs.surface, borderRadius: rayon.groupe }]}>
          {enfants.map((enfant, index) => (
            <Fragment key={index}>
              {index > 0 ? (
                <View
                  style={[styles.separateur, { backgroundColor: couleurs.separateur, marginLeft: espace.l }]}
                />
              ) : null}
              {enfant}
            </Fragment>
          ))}
        </View>
      ) : (
        <View style={{ gap: espace.m }}>{children}</View>
      )}

      {pied ? (
        <Texte variante="note" ton="secondaire" style={{ paddingHorizontal: espace.l, paddingTop: espace.s }}>
          {pied}
        </Texte>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  groupe: {
    overflow: 'hidden',
  },
  separateur: {
    height: StyleSheet.hairlineWidth,
  },
});
