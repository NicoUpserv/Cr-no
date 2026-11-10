import { Stack } from 'expo-router';

import { EtatVide } from '@/components/ui';

export default function MessagesEleve() {
  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <EtatVide icone="message" titre="Aucun message" message="Les messages de ton auto-école et de tes enseignants apparaîtront ici." />
    </>
  );
}
