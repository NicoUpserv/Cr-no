/** Messages des élèves, pour la direction : la conversation la plus récente en premier. Vouvoiement. */
import { Stack, useRouter } from 'expo-router';

import { Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import { trouverEleve } from '@/data/depot';
import { useDossier } from '@/lib/dossier';
import { formatIlYA } from '@/lib/format';

export default function MessagesDirection() {
  const router = useRouter();
  const dossier = useDossier();
  const conversations = dossier.conversations();
  const maintenant = new Date();

  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      {conversations.length === 0 ? (
        <EtatVide icone="message" titre="Aucun message" message="Les messages de vos élèves apparaîtront ici." />
      ) : (
        <Ecran>
          <Section pied="Réservé à la direction et à l’élève : les enseignants n’ont pas accès aux messages.">
            {conversations.map(({ eleveId, dernier }) => {
              const eleve = trouverEleve(eleveId);
              const n = dossier.nonLus(eleveId, 'direction');
              const apercu = dernier.texte.length > 70 ? `${dernier.texte.slice(0, 70)}…` : dernier.texte;
              return (
                <Ligne
                  key={eleveId}
                  icone="message"
                  titre={`${eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}${n > 0 ? ` · ${n} non lu${n > 1 ? 's' : ''}` : ''}`}
                  sousTitre={`${dernier.de === 'auto-ecole' ? 'Vous : ' : ''}${apercu} · ${formatIlYA(dernier.envoyeLe, maintenant)}`}
                  sousTitreAlerte={n > 0}
                  onPress={() => router.push({ pathname: '/direction/conversation', params: { eleveId } })}
                />
              );
            })}
          </Section>
        </Ecran>
      )}
    </>
  );
}
