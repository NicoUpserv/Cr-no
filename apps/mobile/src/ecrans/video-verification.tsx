/** Vidéo d'explication des vérifications (tournée sur la voiture 3D), puis les fiches qu'elle couvre. */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useWindowDimensions, View } from 'react-native';

import { Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import { trouverFicheVerification, trouverVideoVerification } from '@/data/depot';
import type { VideoVerification } from '@/features/verifications/types';
import { useTheme } from '@/theme/use-theme';

import { cheminsVerifications, type VueVerifications } from './verifications';

function Lecteur({ video }: { video: VideoVerification }) {
  const { couleurs, rayon, espace } = useTheme();
  const { width } = useWindowDimensions();
  const player = useVideoPlayer(video.source, (p) => {
    p.loop = false;
  });
  // Format paysage 16:9, sur toute la largeur utile.
  const largeur = Math.min(width, 760) - 2 * espace.l;
  const hauteur = Math.round((largeur * 9) / 16);
  return (
    <View style={{ paddingHorizontal: espace.l, paddingTop: espace.m }}>
      <View style={{ width: largeur, height: hauteur, borderRadius: rayon.groupe, overflow: 'hidden', backgroundColor: couleurs.bitume }}>
        <VideoView player={player} style={{ width: largeur, height: hauteur }} nativeControls contentFit="contain" />
      </View>
    </View>
  );
}

export function EcranVideoVerification({ vue }: { vue: VueVerifications }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const video = trouverVideoVerification(id);

  if (!video) {
    return (
      <>
        <Stack.Screen options={{ title: 'Vidéo', headerLargeTitle: false }} />
        <EtatVide icone="cours" titre="Vidéo introuvable" message="Revenez à la liste des vérifications." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: video.titre, headerLargeTitle: false }} />
      <Ecran>
        <Lecteur video={video} />
        <Section
          titre="Fiches expliquées"
          pied="Vidéo réalisée sur une voiture 3D générique, voix de synthèse. L’emplacement exact des éléments varie selon les modèles.">
          {video.fiches.map((numero) => {
            const fiche = trouverFicheVerification(numero);
            if (!fiche) return null;
            return (
              <Ligne
                key={numero}
                icone="document"
                titre={`${numero} · ${fiche.verification}`}
                onPress={() => router.push({ pathname: cheminsVerifications[vue].fiche, params: { numero } })}
              />
            );
          })}
        </Section>
      </Ecran>
    </>
  );
}
