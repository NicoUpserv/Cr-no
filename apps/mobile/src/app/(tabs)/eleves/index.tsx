import { Stack } from 'expo-router';

import { EtatVide } from '@/components/ui';

export default function EcranEleves() {
  return (
    <>
      <Stack.Screen options={{ title: 'Élèves' }} />
      <EtatVide icone="document" titre="Élèves" message="La liste des élèves arrive bientôt." />
    </>
  );
}
