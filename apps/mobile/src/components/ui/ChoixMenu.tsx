import { Host, Picker } from '@expo/ui';
import { View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

type Option<T extends string | number> = {
  valeur: T;
  libelle: string;
};

type Props<T extends string | number> = {
  valeur: T;
  options: Option<T>[];
  onChange: (valeur: T) => void;
  /** Décrit le choix pour les lecteurs d'écran (« Jour du créneau »). */
  accessibilityLabel: string;
};

/**
 * Choix dans une liste courte, avec le menu natif du système :
 * menu SwiftUI sur iOS, menu déroulant Material sur Android, liste sur le web.
 * À utiliser pour tout choix parmi quelques valeurs (jour, motif, permis…).
 */
export function ChoixMenu<T extends string | number>({ valeur, options, onChange, accessibilityLabel }: Props<T>) {
  const { couleurs, cibleTactile } = useTheme();
  return (
    <View accessibilityLabel={accessibilityLabel} style={{ minHeight: cibleTactile, justifyContent: 'center' }}>
      <Host matchContents seedColor={couleurs.teinte}>
        <Picker selectedValue={valeur} onValueChange={onChange} appearance="menu">
          {options.map((option) => (
            <Picker.Item key={String(option.valeur)} label={option.libelle} value={option.valeur} />
          ))}
        </Picker>
      </Host>
    </View>
  );
}
