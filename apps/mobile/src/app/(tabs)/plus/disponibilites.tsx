import { Stack } from 'expo-router';

import { EtatVide } from '@/components/ui';

export default function MesDisponibilites() {
  return (
    <>
      <Stack.Screen options={{ title: 'Mes disponibilités', headerLargeTitle: false }} />
      <EtatVide icone="horloge" titre="Mes disponibilités" message="La gestion des disponibilités arrive bientôt." />
    </>
  );
}
