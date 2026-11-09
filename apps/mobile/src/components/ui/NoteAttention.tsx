import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Icone } from './Icone';
import { Texte } from './Texte';

type Props = {
  titre: string;
  /** La preuve : ce qui permet de vérifier l'alerte (date d'envoi, nombre d'ouvertures…). */
  preuve: string;
};

/**
 * Point d'attention (jaune de signalisation temporaire).
 * Réservé à ce qui demande une action ; chaque alerte montre sa preuve.
 */
export function NoteAttention({ titre, preuve }: Props) {
  const { couleurs, espace, rayon } = useTheme();
  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${titre}. ${preuve}`}
      style={[
        styles.note,
        {
          backgroundColor: couleurs.attentionFond,
          borderRadius: rayon.groupe,
          padding: espace.l,
          gap: espace.m,
        },
      ]}>
      <Icone nom="attention" taille={20} couleur={couleurs.attentionPictogramme} />
      <View style={styles.textes}>
        <Texte variante="entete" couleur={couleurs.attentionTexte}>
          {titre}
        </Texte>
        <Texte variante="sousTitre" couleur={couleurs.attentionTexte} tabulaire>
          {preuve}
        </Texte>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textes: {
    flex: 1,
    gap: 2,
  },
});
