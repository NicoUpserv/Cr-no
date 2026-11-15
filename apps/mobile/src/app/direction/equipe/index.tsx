/** Équipe : les enseignants et leurs demandes d'absence. Vouvoiement. */
import { Stack } from 'expo-router';

import { DemandesAbsence } from '@/components/demandes-absence';
import { Ecran, Ligne, Section } from '@/components/ui';
import { listerMoniteurs } from '@/data/depot';
import { dateLocale } from '@/features/planning/creneaux';
import { leconsDuJour } from '@/features/planning/lecons';
import { usePlanning } from '@/lib/planning';

export default function EquipeDirection() {
  const { lecons: toutes, maintenant } = usePlanning();
  const lecons = leconsDuJour(toutes, dateLocale(maintenant));
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
