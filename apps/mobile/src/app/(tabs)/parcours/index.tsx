import { Stack } from 'expo-router';

import { EtatVide } from '@/components/ui';

export default function EcranParcours() {
  return (
    <>
      <Stack.Screen options={{ title: 'Parcours' }} />
      <EtatVide icone="route" titre="Parcours" message="Les parcours d’examen arrivent bientôt." />
    </>
  );
}
