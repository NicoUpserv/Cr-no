import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import type { PropsChoixSegmente } from './ChoixSegmente.types';

/** Sélecteur segmenté natif iOS (SwiftUI `Picker` en style `segmented`). */
export function ChoixSegmente<T extends string>({ valeur, options, onChange, accessibilityLabel }: PropsChoixSegmente<T>) {
  const { couleurs, espace } = useTheme();
  return (
    <View accessibilityLabel={accessibilityLabel} style={{ paddingHorizontal: espace.l, paddingTop: espace.m }}>
      <Host matchContents={{ vertical: true }} seedColor={couleurs.teinte}>
        <Picker selection={valeur} onSelectionChange={(v) => onChange(v as T)} modifiers={[pickerStyle('segmented')]}>
          {options.map((o) => (
            <Text key={o.valeur} modifiers={[tag(o.valeur)]}>
              {o.libelle}
            </Text>
          ))}
        </Picker>
      </Host>
    </View>
  );
}
