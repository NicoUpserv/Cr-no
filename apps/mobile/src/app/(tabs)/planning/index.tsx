import { Stack } from 'expo-router';

import { EtatVide } from '@/components/ui';

export default function EcranPlanning() {
  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <EtatVide icone="calendrier" titre="Planning" message="Le planning de l’auto-école arrive bientôt." />
    </>
  );
}
