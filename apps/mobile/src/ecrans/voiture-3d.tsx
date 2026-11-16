/**
 * Voiture 3D générique (citadine 5 portes, sans marque) : ouvrir les portes, le capot, le coffre,
 * allumer les feux, et toucher une zone pour voir ses fiches de vérification.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { VueVoiture3d } from '@/components/vue-voiture-3d';
import { useTheme } from '@/theme/use-theme';

import type { VueVerifications } from './verifications';

const listes = {
  eleve: '/eleve/menu/verifications',
  enseignant: '/plus/verifications',
} as const;

export function EcranVoiture3d({ vue }: { vue: VueVerifications }) {
  const { zone } = useLocalSearchParams<{ zone?: string }>();
  const router = useRouter();
  const { sombre, couleurs } = useTheme();
  const versZone = useCallback((z: string) => router.push({ pathname: listes[vue], params: { zone: z } }), [router, vue]);

  return (
    <>
      <Stack.Screen options={{ title: 'Voiture 3D', headerLargeTitle: false }} />
      <View style={{ flex: 1, backgroundColor: couleurs.fond }}>
        <VueVoiture3d zone={zone} sombre={sombre} onZone={versZone} />
      </View>
    </>
  );
}
