/** Planning de l'élève : ses prochaines leçons, réservation et annulation. Tutoiement. */
import { Stack, useRouter } from 'expo-router';

import { Cartouche, Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, trouverMoniteur } from '@/data/depot';
import { DELAI_ANNULATION_HEURES } from '@/features/planning/creneaux';
import { leconsDeLEleve } from '@/features/planning/lecons';
import { formatHeure, formatJour } from '@/lib/format';
import { usePlanning } from '@/lib/planning';

export default function PlanningEleve() {
  const router = useRouter();
  const { lecons: toutes, maintenant } = usePlanning();
  const lecons = leconsDeLEleve(toutes, idEleveConnecte()).filter((l) => new Date(l.fin) > maintenant);

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        <Section titre="Mes prochaines leçons" pied={lecons.length > 0 ? `Touche une leçon pour la voir ou l’annuler (jusqu’à ${DELAI_ANNULATION_HEURES} h avant).` : undefined}>
          {lecons.length === 0 ? (
            <Ligne icone="calendrier" titre="Aucune leçon prévue" sousTitre="Réserve ta prochaine leçon ci-dessous." />
          ) : (
            lecons.map((lecon) => {
              const moniteur = trouverMoniteur(lecon.moniteurId);
              return (
                <Ligne
                  key={lecon.id}
                  titre={`${formatJour(lecon.debut, maintenant)} · ${formatHeure(lecon.debut)} → ${formatHeure(lecon.fin)}`}
                  sousTitre={`${lecon.lieuDepart.nom}${moniteur ? ` · avec ${moniteur.prenom} ${moniteur.nom}` : ''}`}
                  aDroite={<Cartouche numero={lecon.numero} />}
                  onPress={() => router.push({ pathname: '/eleve/planning/[leconId]', params: { leconId: lecon.id } })}
                />
              );
            })
          )}
        </Section>
        <Section pied="Tu choisis l’enseignant, le jour, l’heure et le lieu parmi les créneaux libres de ton auto-école.">
          <Ligne icone="ajouter" titre="Réserver une leçon" onPress={() => router.push('/eleve/planning/reserver')} />
        </Section>
      </Ecran>
    </>
  );
}
