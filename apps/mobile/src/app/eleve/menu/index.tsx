import { Stack, useRouter } from 'expo-router';

import { SelecteurProfil } from '@/components/selecteur-profil';
import { Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, trouverEleve } from '@/data/depot';
import { useVerificationsEleve } from '@/lib/verifications';

export default function MenuEleve() {
  const router = useRouter();
  const verifications = useVerificationsEleve(trouverEleve(idEleveConnecte()));
  return (
    <>
      <Stack.Screen options={{ title: 'Menu' }} />
      <Ecran>
        <Section titre="Apprendre">
          <Ligne icone="cours" titre="Mon cours à préparer" onPress={() => router.push('/eleve/cours')} />
          <Ligne
            icone="voiture"
            titre="Vérifications intérieures et extérieures"
            sousTitre={verifications.accessible ? `${verifications.maitrisees.length} fiches maîtrisées sur 100 · voiture 3D` : 'Disponible à la fin de la compétence 1'}
            onPress={() => router.push('/eleve/menu/verifications')}
          />
          <Ligne icone="livret" titre="Mon livret d’apprentissage" sousTitre="Bientôt disponible" />
          <Ligne icone="examen" titre="Code de la route" sousTitre="Bientôt disponible" />
        </Section>
        <SelecteurProfil />
      </Ecran>
    </>
  );
}
