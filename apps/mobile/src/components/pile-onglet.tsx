import { Stack } from 'expo-router';

import { useTheme } from '@/theme/use-theme';

/**
 * Pile de navigation d'un onglet : barre native avec grand titre sur iOS
 * (qui se replie au défilement), barre d'application standard sur Android.
 */
export function PileOnglet() {
  const { couleurs } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: couleurs.fond },
        headerTintColor: couleurs.teinte,
        headerTitleStyle: { color: couleurs.texte },
        headerLargeTitleStyle: { color: couleurs.texte },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: couleurs.fond },
      }}
    />
  );
}
