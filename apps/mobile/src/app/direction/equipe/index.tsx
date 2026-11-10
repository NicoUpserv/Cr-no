/** Équipe : les enseignants et leurs demandes d'absence. Vouvoiement. */
import { Stack } from 'expo-router';

import { DemandesAbsence } from '@/components/demandes-absence';
import { Ecran, Ligne, Section } from '@/components/ui';
import { leconsDuJour, listerMoniteurs } from '@/data/depot';

export default function EquipeDirection() {
  const lecons = leconsDuJour();
  return (
    <>
      <Stack.Screen options={{ title: 'Équipe' }} />
      <Ecran>
        <Section titre="Enseignants">
          {listerMoniteurs().map((moniteur) => {
            const n = lecons.filter((l) => l.moniteurId === moniteur.id).length;
            return (
              <Ligne
                key={moniteur.id}
                icone="eleve"
                titre={`${moniteur.prenom} ${moniteur.nom}`}
                sousTitre={`${n} leçon${n > 1 ? 's' : ''} aujourd’hui`}
              />
            );
          })}
        </Section>
        <DemandesAbsence />
      </Ecran>
    </>
  );
}
