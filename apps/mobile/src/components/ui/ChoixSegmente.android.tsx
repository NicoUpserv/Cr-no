import { Host, SegmentedButton, SingleChoiceSegmentedButtonRow, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import type { PropsChoixSegmente } from './ChoixSegmente.types';

/** Boutons segmentés natifs Android (Material 3 `SingleChoiceSegmentedButtonRow`). */
export function ChoixSegmente<T extends string>({ valeur, options, onChange, accessibilityLabel }: PropsChoixSegmente<T>) {
  const { couleurs, espace } = useTheme();
  return (
    <View accessibilityLabel={accessibilityLabel} style={{ paddingHorizontal: espace.l, paddingTop: espace.m }}>
      <Host matchContents={{ vertical: true }} seedColor={couleurs.teinte}>
        <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
          {options.map((o) => (
            <SegmentedButton key={o.valeur} selected={o.valeur === valeur} onClick={() => onChange(o.valeur)}>
              <SegmentedButton.Label>
                <Text>{o.libelle}</Text>
              </SegmentedButton.Label>
            </SegmentedButton>
          ))}
        </SingleChoiceSegmentedButtonRow>
      </Host>
    </View>
  );
}
