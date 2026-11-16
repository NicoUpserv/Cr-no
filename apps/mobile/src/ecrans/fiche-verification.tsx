/**
 * Une fiche de vérification : la vérification à faire, puis la question de sécurité routière
 * et la question de premiers secours, réponses masquées pour s'entraîner.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Switch } from 'react-native';

import { Ecran, EtatVide, Ligne, Section, Texte } from '@/components/ui';
import { idEleveConnecte, listerFichesVerification, trouverEleve, trouverFicheVerification, videosDeLaFiche } from '@/data/depot';
import { libellesZones, tirerFiche, zoneDeFiche } from '@/features/verifications/zones';
import { useVerificationsEleve } from '@/lib/verifications';
import { useTheme } from '@/theme/use-theme';

import { cheminsVerifications, type VueVerifications } from './verifications';

export function EcranFicheVerification({ vue }: { vue: VueVerifications }) {
  const { numero, hasard } = useLocalSearchParams<{ numero: string; hasard?: string }>();
  const router = useRouter();
  const { couleurs, espace } = useTheme();
  const [reponses, setReponses] = useState<{ qser: boolean; secours: boolean }>({ qser: false, secours: false });
  const eleve = vue === 'eleve' ? trouverEleve(idEleveConnecte()) : undefined;
  const suivi = useVerificationsEleve(eleve);
  const fiche = trouverFicheVerification(numero);
  const tu = vue === 'eleve';
  const chemins = cheminsVerifications[vue];

  if (!fiche) {
    return (
      <>
        <Stack.Screen options={{ title: 'Fiche', headerLargeTitle: false }} />
        <EtatVide icone="document" titre="Fiche introuvable" message="Les fiches vont de 00 à 99. Revenez à la liste des vérifications." />
      </>
    );
  }

  const zone = zoneDeFiche(fiche);
  const reponse = (cle: 'qser' | 'secours', texte: string) =>
    reponses[cle] ? (
      <Ligne titre={texte} sousTitre="Réponse attendue" />
    ) : (
      <Ligne
        icone="valider"
        titre="Voir la réponse"
        sousTitre={tu ? 'Réponds d’abord à voix haute, comme à l’examen' : undefined}
        onPress={() => setReponses((r) => ({ ...r, [cle]: true }))}
      />
    );

  return (
    <>
      <Stack.Screen options={{ title: `Fiche ${fiche.numero}`, headerLargeTitle: false }} />
      <Ecran>
        <Section titre={fiche.type === 'VI' ? 'Vérification intérieure' : 'Vérification extérieure'} pied={fiche.precision}>
          <Ligne icone={fiche.type === 'VI' ? 'voiture' : 'route'} titre={fiche.verification} sousTitre={libellesZones[zone]} />
          {videosDeLaFiche(fiche.numero).map((video) => (
            <Ligne
              key={video.id}
              icone="cours"
              titre={`Vidéo : ${video.titre}`}
              onPress={() => router.push({ pathname: chemins.video, params: { id: video.id } })}
            />
          ))}
          <Ligne
            icone="voiture"
            titre="Voir sur la voiture 3D"
            onPress={() => router.push({ pathname: chemins.voiture, params: { zone } })}
          />
        </Section>

        <Section titre="Question de sécurité routière">
          <Ligne icone="observation" titre={fiche.qser} />
          {reponse('qser', fiche.qserReponse)}
        </Section>

        <Section titre="Premiers secours">
          <Ligne icone="attention" titre={fiche.secours} />
          {reponse('secours', fiche.secoursReponse)}
        </Section>

        {tu ? (
          <Section pied="Les fiches maîtrisées sont cochées dans la liste.">
            <Ligne
              titre="Je maîtrise cette fiche"
              aDroite={
                <Switch
                  value={suivi.estMaitrisee(fiche.numero)}
                  onValueChange={() => suivi.basculerMaitrise(fiche.numero)}
                  trackColor={{ false: couleurs.separateur, true: couleurs.teinte }}
                  ios_backgroundColor={couleurs.separateur}
                  accessibilityLabel="Je maîtrise cette fiche"
                />
              }
            />
          </Section>
        ) : null}

        {hasard ? (
          <Section>
            <Ligne
              icone="hasard"
              titre="Tirer une autre fiche"
              onPress={() => {
                const f = tirerFiche(listerFichesVerification().filter((x) => x.numero !== fiche.numero));
                if (f) router.replace({ pathname: chemins.fiche, params: { numero: f.numero, hasard: '1' } });
              }}
            />
          </Section>
        ) : null}

        <Texte variante="note" ton="tertiaire" style={{ paddingHorizontal: espace.xl, paddingTop: espace.s }}>
          Source : banque officielle de la Sécurité routière, version du 1er janvier 2018.
        </Texte>
      </Ecran>
    </>
  );
}
