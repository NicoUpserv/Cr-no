import { Stack } from 'expo-router';

import { SelecteurProfil } from '@/components/selecteur-profil';
import { Ecran, Ligne, Section } from '@/components/ui';

export default function PlusDirection() {
  return (
    <>
      <Stack.Screen options={{ title: 'Plus' }} />
      <Ecran>
        <Section titre="Mon auto-école">
          <Ligne icone="offre" titre="Promotions et parrainage" sousTitre="Bientôt disponible" />
          <Ligne icone="document" titre="Facturation et paiements" sousTitre="Bientôt disponible" />
          <Ligne icone="examen" titre="Places d’examen" sousTitre="Bientôt disponible" />
        </Section>
        <SelecteurProfil />
      </Ecran>
    </>
  );
}
