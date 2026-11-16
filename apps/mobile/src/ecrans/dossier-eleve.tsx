/**
 * Dossier d'un élève, vu par la direction : pièces manquantes, documents à vérifier, relances.
 * Relances automatiques à J+3, J+7 et J+14 après l'inscription, puis relance manuelle. Vouvoiement.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { DocumentsAVerifier } from '@/components/documents-a-verifier';
import { Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import { trouverEleve } from '@/data/depot';
import { calendrierRelances, JOURS_RELANCE } from '@/features/dossier/relances';
import { midiLocal } from '@/features/planning/creneaux';
import { useDossier } from '@/lib/dossier';
import { formatDateCourte } from '@/lib/format';

/** Accorde chaque mot (« 2 relances automatiques »). */
const pluriel = (n: number, mots: string) => `${n} ${mots.split(' ').map((m) => (n > 1 ? `${m}s` : m)).join(' ')}`;

export function EcranDossierEleve() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dossier = useDossier();
  const [relanceEnvoyee, setRelanceEnvoyee] = useState(false);
  const eleve = trouverEleve(id);

  if (!eleve) {
    return (
      <>
        <Stack.Screen options={{ title: 'Dossier', headerLargeTitle: false }} />
        <EtatVide icone="document" titre="Élève introuvable" message="Revenez à la liste des élèves." />
      </>
    );
  }

  const manquantes = dossier.piecesManquantes(eleve.id);
  const relances = calendrierRelances(eleve.inscritLe, new Date());
  const nonLus = dossier.nonLus(eleve.id, 'direction');
  const regle = `Relances automatiques à J+${JOURS_RELANCE.join(', J+')} après l’inscription (le ${formatDateCourte(midiLocal(eleve.inscritLe))}), dans l’appli et par e-mail. L’envoi des e-mails n’est pas encore actif dans la démo.`;

  return (
    <>
      <Stack.Screen options={{ title: `Dossier · ${eleve.prenom}`, headerLargeTitle: false }} />
      <Ecran>
        <Section titre="Pièces manquantes">
          {manquantes.length === 0 ? (
            <Ligne icone="valider" titre="Dossier complet" />
          ) : (
            manquantes.map((piece) => {
              const enVerif = dossier.statutPiece(eleve.id, piece) === 'en-verification';
              return (
                <Ligne
                  key={piece}
                  icone="document"
                  titre={piece}
                  sousTitre={enVerif ? 'Reçue · à vérifier ci-dessous' : 'Pas encore envoyée'}
                  sousTitreAlerte={!enVerif}
                />
              );
            })
          )}
        </Section>

        <DocumentsAVerifier eleveId={eleve.id} titre="Documents reçus à vérifier" />

        {manquantes.length > 0 ? (
          <Section titre="Relances" pied={regle}>
            <Ligne
              icone="horloge"
              titre={
                relances.prochaine
                  ? `Prochaine relance automatique : ${formatDateCourte(midiLocal(relances.prochaine))}`
                  : 'Relances automatiques terminées'
              }
              sousTitre={`${pluriel(relances.envoyees.length, 'relance automatique')} déjà ${relances.envoyees.length > 1 ? 'envoyées' : 'envoyée'}`}
            />
            <Ligne
              icone="relancer"
              titre={relanceEnvoyee ? 'Relance envoyée' : 'Relancer maintenant'}
              sousTitre={relanceEnvoyee ? `${eleve.prenom} l’a reçue dans ses messages` : `Rappeler à ${eleve.prenom} les pièces manquantes`}
              onPress={
                relanceEnvoyee
                  ? undefined
                  : () => {
                      dossier.relancer(eleve.id);
                      setRelanceEnvoyee(true);
                    }
              }
            />
          </Section>
        ) : null}

        <Section>
          <Ligne
            icone="message"
            titre={`Messages avec ${eleve.prenom}`}
            sousTitre={nonLus > 0 ? `${nonLus} message${nonLus > 1 ? 's' : ''} non lu${nonLus > 1 ? 's' : ''}` : undefined}
            sousTitreAlerte={nonLus > 0}
            onPress={() => router.push({ pathname: '/direction/eleves/conversation', params: { eleveId: eleve.id } })}
          />
        </Section>
      </Ecran>
    </>
  );
}
