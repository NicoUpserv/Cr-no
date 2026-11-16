import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Switch } from 'react-native';

import { Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import { listerEleves } from '@/data/depot';
import { leconsEffectuees } from '@/features/planning/lecons';
import { usePlanning } from '@/lib/planning';
import { libellesPermis } from '@/data/types';
import { filtrerEleves, type FiltreEleves } from '@/features/eleves/filtrer';
import { formatPiecesManquantes } from '@/lib/format';
import { useDossier } from '@/lib/dossier';
import { useTheme } from '@/theme/use-theme';

export type CheminFiche = '/eleves/[id]' | '/direction/eleves/[id]';

/**
 * Liste des élèves (partagée par l'enseignant et la direction). Première version : DeepSeek, tâche 01.
 * Le dossier (pièces manquantes) ne concerne que la direction : l'enseignant ne voit ni le filtre ni les pièces.
 */
export function EcranListeEleves({ cheminFiche }: { cheminFiche: CheminFiche }) {
  const router = useRouter();
  const { lecons, maintenant } = usePlanning();
  const { couleurs } = useTheme();
  const direction = cheminFiche === '/direction/eleves/[id]';
  const dossier = useDossier();
  const [recherche, setRecherche] = useState('');
  const [seulementDossierIncomplet, setSeulementDossierIncomplet] = useState(false);

  const filtre: FiltreEleves = { recherche, seulementDossierIncomplet, permis: 'tous' };
  // Pièces à jour (une pièce validée par la direction sort de la liste).
  const eleves = filtrerEleves(
    listerEleves().map((e) => ({ ...e, piecesManquantes: dossier.piecesManquantes(e.id) })),
    filtre,
  );
  const filtreActif = recherche.trim().length > 0 || seulementDossierIncomplet;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Élèves',
          headerSearchBarOptions: {
            placeholder: 'Rechercher un élève',
            onChangeText: (evenement) => setRecherche(evenement.nativeEvent.text),
            onCancelButtonPress: () => setRecherche(''),
          },
        }}
      />
      <Ecran>
        {direction ? (
          <Section titre="Filtres">
            <Ligne
              titre="Dossier incomplet uniquement"
              aDroite={
                <Switch
                  value={seulementDossierIncomplet}
                  onValueChange={setSeulementDossierIncomplet}
                  trackColor={{ false: couleurs.separateur, true: couleurs.teinte }}
                  ios_backgroundColor={couleurs.separateur}
                  accessibilityLabel="Dossier incomplet uniquement"
                />
              }
            />
          </Section>
        ) : null}

        {eleves.length > 0 ? (
          <Section>
            {eleves.map((eleve) => {
              const manquantes = direction ? eleve.piecesManquantes.length : 0;
              const sousTitre = `${libellesPermis[eleve.permis]} · ${
                manquantes > 0
                  ? formatPiecesManquantes(manquantes)
                  : `Leçon ${leconsEffectuees(lecons, eleve.id, maintenant)} sur ${eleve.forfaitLecons}`
              }`;

              return (
                <Ligne
                  key={eleve.id}
                  titre={`${eleve.prenom} ${eleve.nom}`}
                  sousTitre={sousTitre}
                  sousTitreAlerte={manquantes > 0}
                  onPress={() =>
                    router.push({ pathname: cheminFiche, params: { id: eleve.id } })
                  }
                />
              );
            })}
          </Section>
        ) : (
          <EtatVide
            icone="document"
            titre="Aucun résultat"
            message={
              filtreActif
                ? 'Aucun élève ne correspond. Modifiez la recherche ou retirez le filtre « Dossier incomplet uniquement ».'
                : 'Aucun élève à afficher pour le moment.'
            }
          />
        )}
      </Ecran>
    </>
  );
}
