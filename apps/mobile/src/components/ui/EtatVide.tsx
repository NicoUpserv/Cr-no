import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Icone, type NomIcone } from './Icone';
import { Texte } from './Texte';

type Props = {
  icone: NomIcone;
  titre: string;
  message: string;
};

/** État vide d'un écran ou d'une liste : dit ce qui manque et quoi faire. */
export function EtatVide({ icone, titre, message }: Props) {
  const { couleurs, espace } = useTheme();
  return (
    <View style={[styles.vide, { padding: espace.xxxl, gap: espace.s }]}>
      <Icone nom={icone} taille={36} couleur={couleurs.texteTertiaire} />
      <Texte variante="titre3" style={styles.centre}>
        {titre}
      </Texte>
      <Texte variante="sousTitre" ton="secondaire" style={styles.centre}>
        {message}
      </Texte>
    </View>
  );
}

const styles = StyleSheet.create({
  vide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centre: {
    textAlign: 'center',
  },
});
