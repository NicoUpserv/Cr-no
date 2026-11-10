import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Switch } from 'react-native';

import { Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import { leconsEffectuees, listerEleves } from '@/data/depot';
import { libellesPermis } from '@/data/types';
import { filtrerEleves, type FiltreEleves } from '@/features/eleves/filtrer';
import { formatPiecesManquantes } from '@/lib/format';
import { useTheme } from '@/theme/use-theme';

export type CheminFiche = '/eleves/[id]' | '/direction/eleves/[id]';

/** Liste des élèves (partagée par l'enseignant et la direction). Première version : DeepSeek, tâche 01. */
export function EcranListeEleves({ cheminFiche }: { cheminFiche: CheminFiche }) {
  const router = useRouter();
  const { couleurs } = useTheme();
  const [recherche, setRecherche] = useState('');
  const [seulementDossierIncomplet, setSeulementDossierIncomplet] = useState(false);

  const filtre: FiltreEleves = { recherche, seulementDossierIncomplet, permis: 'tous' };
  const eleves = filtrerEleves(listerEleves(), filtre);
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

        {eleves.length > 0 ? (
          <Section>
            {eleves.map((eleve) => {
              const manquantes = eleve.piecesManquantes.length;
              const sousTitre = `${libellesPermis[eleve.permis]} · ${
                manquantes > 0
                  ? formatPiecesManquantes(manquantes)
                  : `Leçon ${leconsEffectuees(eleve.id)} sur ${eleve.forfaitLecons}`
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
