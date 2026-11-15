import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Texte } from './Texte';

type Props = {
  titre: string;
  onPress: () => void;
  /** `principal` : rempli avec la teinte (une seule action principale par écran). `secondaire` : texte teinté. */
  variante?: 'principal' | 'secondaire';
  accessibilityHint?: string;
  /** Action indisponible (ex. quiz verrouillé) : grisée, non cliquable. Dire à côté ce qui manque. */
  desactive?: boolean;
};

/** Bouton d'action en bas d'écran. Une seule action principale visible à la fois. */
export function Bouton({ titre, onPress, variante = 'principal', accessibilityHint, desactive }: Props) {
  const { couleurs, espace, rayon, cibleTactile } = useTheme();
  const principal = variante === 'principal';
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!desactive }}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: couleurs.ondulation }}
      style={({ pressed }) => [
        styles.bouton,
        {
          minHeight: cibleTactile + 6,
          marginHorizontal: espace.l,
          paddingHorizontal: espace.l,
          borderRadius: rayon.groupe,
          backgroundColor: principal ? (desactive ? couleurs.surfacePressee : couleurs.teinte) : 'transparent',
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <Texte
        variante="entete"
        couleur={desactive ? couleurs.texteSecondaire : principal ? couleurs.surTeinte : couleurs.teinte}>
        {titre}
      </Texte>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
