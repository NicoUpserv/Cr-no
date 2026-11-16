import { Stack, useRouter } from 'expo-router';

import { SelecteurProfil } from '@/components/selecteur-profil';
import { Ecran, Ligne, Section } from '@/components/ui';

export default function EcranPlus() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Plus' }} />
      <Ecran>
        <Section titre="Mon activité">
          <Ligne
            icone="horloge"
            titre="Mes disponibilités"
            sousTitre="Horaires habituels, ouvertures ponctuelles, absences"
            onPress={() => router.push('/plus/disponibilites')}
          />
        </Section>
        <Section titre="Pédagogie">
          <Ligne
            icone="voiture"
            titre="Vérifications intérieures et extérieures"
            sousTitre="100 fiches officielles, voiture 3D, PDF"
            onPress={() => router.push('/plus/verifications')}
          />
        </Section>
        <SelecteurProfil />
      </Ecran>
    </>
  );
}
