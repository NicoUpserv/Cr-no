/** Planning du jour de toute l'équipe, une section par enseignant. Vouvoiement. */
import { Stack, useRouter } from 'expo-router';

import { Cartouche, Ecran, Ligne, Section } from '@/components/ui';
import { leconsDuJour, listerMoniteurs, trouverEleve } from '@/data/depot';
import { formatHeure, formatJour } from '@/lib/format';

export default function PlanningDirection() {
  const router = useRouter();
  const maintenant = new Date();
  const lecons = leconsDuJour(maintenant);

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        {listerMoniteurs().map((moniteur) => {
          const siennes = lecons.filter((l) => l.moniteurId === moniteur.id);
          return (
            <Section key={moniteur.id} titre={`${moniteur.prenom} ${moniteur.nom} · ${formatJour(maintenant, maintenant).toLowerCase()}`}>
              {siennes.length === 0 ? (
                <Ligne titre="Aucune leçon aujourd’hui" sousTitre="Créneaux libres visibles par les élèves" />
              ) : (
                siennes.map((lecon) => {
                  const eleve = trouverEleve(lecon.eleveId);
                  const terminee = new Date(lecon.fin) <= maintenant;
                  return (
                    <Ligne
                      key={lecon.id}
                      titre={`${formatHeure(lecon.debut)} → ${formatHeure(lecon.fin)} · ${eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}`}
                      sousTitre={`${lecon.lieuDepart.nom}${terminee ? ' · terminée' : ''}`}
                      aDroite={<Cartouche numero={lecon.numero} />}
                      onPress={() => router.push({ pathname: '/direction/eleves/[id]', params: { id: lecon.eleveId } })}
                    />
                  );
                })
              )}
            </Section>
          );
        })}
      </Ecran>
    </>
  );
}
