/**
 * Vérifications intérieures et extérieures (banque officielle, 100 fiches) : par zone de la voiture,
 * tirage au hasard comme à l'examen, voiture 3D, PDF officiel.
 * Élève : accessible à la fin de la compétence C1 (ou débloqué par l'enseignant), fiches maîtrisées cochées. Tutoiement.
 * Enseignant : toujours accessible. Vouvoiement.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { ChoixSegmente, Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import {
  CHEMIN_PDF_VERIFICATIONS,
  idEleveConnecte,
  libelleCompetence,
  listerFichesVerification,
  listerVideosVerification,
  trouverEleve,
} from '@/data/depot';
import type { FicheVerification, ZoneVoiture } from '@/features/verifications/types';
import { libellesZones, ORDRE_ZONES, tirerFiche, zoneDeFiche } from '@/features/verifications/zones';
import { ouvrirDocumentPublic } from '@/lib/ouvrir-document';
import { useVerificationsEleve } from '@/lib/verifications';

type Filtre = 'toutes' | 'VI' | 'VE';
const FILTRES: { valeur: Filtre; libelle: string }[] = [
  { valeur: 'toutes', libelle: 'Toutes' },
  { valeur: 'VI', libelle: 'Intérieures' },
  { valeur: 'VE', libelle: 'Extérieures' },
];

export type VueVerifications = 'eleve' | 'enseignant';

/** Chemins des écrans de vérifications, selon le profil (chaque profil a sa pile de navigation). */
export const cheminsVerifications = {
  eleve: { fiche: '/eleve/menu/verifications/[numero]', voiture: '/eleve/menu/verifications/voiture', video: '/eleve/menu/verifications/video' },
  enseignant: { fiche: '/plus/verifications/[numero]', voiture: '/plus/verifications/voiture', video: '/plus/verifications/video' },
} as const;

export function EcranVerifications({ vue }: { vue: VueVerifications }) {
  const router = useRouter();
  const { zone } = useLocalSearchParams<{ zone?: ZoneVoiture }>();
  const [filtre, setFiltre] = useState<Filtre>('toutes');
  const [recherche, setRecherche] = useState('');
  const eleve = vue === 'eleve' ? trouverEleve(idEleveConnecte()) : undefined;
  const suivi = useVerificationsEleve(eleve);
  const tu = vue === 'eleve';
  const chemins = cheminsVerifications[vue];

  const ouvrir = (fiche: FicheVerification, hasard = false) =>
    router.push({ pathname: chemins.fiche, params: { numero: fiche.numero, ...(hasard ? { hasard: '1' } : {}) } });

  if (tu && !suivi.accessible) {
    return (
      <>
        <Stack.Screen options={{ title: 'Vérifications' }} />
        <EtatVide
          icone="voiture"
          titre="Disponible à la fin de la compétence 1"
          message={`Les vérifications intérieures et extérieures s’ouvrent quand tu as acquis la compétence C1 « ${libelleCompetence('C1')} ». Ton enseignant peut aussi te les ouvrir plus tôt.`}
        />
      </>
    );
  }

  const terme = recherche.trim().toLowerCase();
  const fiches = listerFichesVerification().filter(
    (f) =>
      (filtre === 'toutes' || f.type === filtre) &&
      (!zone || zoneDeFiche(f) === zone) &&
      (!terme || f.numero === terme.padStart(2, '0') || f.verification.toLowerCase().includes(terme)),
  );
  const zones = ORDRE_ZONES.filter((z) => !zone || z === zone);

  return (
    <>
      <Stack.Screen
        options={{
          title: zone ? libellesZones[zone] : 'Vérifications',
          headerSearchBarOptions: {
            placeholder: 'Numéro ou mot-clé (pneumatique…)',
            onChangeText: (e) => setRecherche(e.nativeEvent.text),
            onCancelButtonPress: () => setRecherche(''),
          },
        }}
      />
      <Ecran>
        <Section
          pied={
            tu
              ? 'À l’examen, l’inspecteur tire un numéro : tu fais la vérification, puis tu réponds à une question de sécurité routière et à une question de premiers secours.'
              : 'Banque officielle de la Sécurité routière (version du 1er janvier 2018) : 50 vérifications intérieures, 50 extérieures.'
          }>
          {tu ? (
            <Ligne
              icone="valider"
              titre={`${suivi.maitrisees.length} fiche${suivi.maitrisees.length > 1 ? 's' : ''} maîtrisée${suivi.maitrisees.length > 1 ? 's' : ''} sur 100`}
              sousTitre={suivi.c1Acquise ? 'Compétence C1 acquise' : 'Ouvert par ton enseignant'}
            />
          ) : null}
          <Ligne
            icone="hasard"
            titre="Tirer une fiche au hasard"
            sousTitre="Comme le jour de l’examen"
            onPress={() => {
              const f = tirerFiche(fiches.length > 0 ? fiches : listerFichesVerification());
              if (f) ouvrir(f, true);
            }}
          />
          <Ligne
            icone="voiture"
            titre="Explorer la voiture en 3D"
            sousTitre={tu ? 'Ouvre les portes, le capot, le coffre et touche une zone' : 'Portes, capot, coffre et zones à vérifier'}
            onPress={() => router.push(chemins.voiture)}
          />
          <Ligne
            icone="telecharger"
            titre="Télécharger le PDF officiel"
            sousTitre="Les 100 fiches, à imprimer ou garder sur le téléphone"
            onPress={() => ouvrirDocumentPublic(CHEMIN_PDF_VERIFICATIONS)}
          />
        </Section>

        {zone ? null : (
          <Section titre="Vidéos" pied="Tournées sur une voiture 3D générique : l’emplacement exact varie selon les modèles.">
            {listerVideosVerification().map((video) => (
              <Ligne
                key={video.id}
                icone="cours"
                titre={video.titre}
                sousTitre={`${video.fiches.length} fiches expliquées`}
                onPress={() => router.push({ pathname: chemins.video, params: { id: video.id } })}
              />
            ))}
          </Section>
        )}

        <ChoixSegmente valeur={filtre} options={FILTRES} onChange={setFiltre} accessibilityLabel="Type de vérification" />

        {fiches.length === 0 ? (
          <EtatVide icone="document" titre="Aucune fiche" message="Aucune fiche ne correspond. Essayez un autre mot-clé ou un numéro de 00 à 99." />
        ) : (
          zones.map((z) => {
            const deLaZone = fiches.filter((f) => zoneDeFiche(f) === z);
            if (deLaZone.length === 0) return null;
            return (
              <Section key={z} titre={`${libellesZones[z]} · ${deLaZone.length}`}>
                {deLaZone.map((f) => (
                  <Ligne
                    key={f.numero}
                    icone={tu && suivi.estMaitrisee(f.numero) ? 'valider' : 'document'}
                    titre={`${f.numero} · ${f.verification}`}
                    sousTitre={`${f.type === 'VI' ? 'Intérieure' : 'Extérieure'}${tu && suivi.estMaitrisee(f.numero) ? ' · maîtrisée' : ''}`}
                    onPress={() => ouvrir(f)}
                  />
                ))}
              </Section>
            );
          })
        )}
      </Ecran>
    </>
  );
}
