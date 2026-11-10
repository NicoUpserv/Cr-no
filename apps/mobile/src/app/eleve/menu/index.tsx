import { Stack, useRouter } from 'expo-router';

import { SelecteurProfil } from '@/components/selecteur-profil';
import { Ecran, Ligne, Section } from '@/components/ui';

export default function MenuEleve() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Menu' }} />
      <Ecran>
        <Section titre="Apprendre">
          <Ligne icone="cours" titre="Mon cours à préparer" onPress={() => router.push('/eleve/cours')} />
          <Ligne icone="livret" titre="Mon livret d’apprentissage" sousTitre="Bientôt disponible" />
          <Ligne icone="examen" titre="Code de la route" sousTitre="Bientôt disponible" />
        </Section>
        <SelecteurProfil />
      </Ecran>
    </>
  );
}
