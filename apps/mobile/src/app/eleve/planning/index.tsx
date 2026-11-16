/** Planning de l'élève, en jour / semaine / mois / année : ses leçons, réservation et annulation. Tutoiement. */
import { Stack, useRouter } from 'expo-router';

import { BarrePeriode, VueAnnee, VueMois, VueSemaine, type ElementCalendrier } from '@/components/calendrier';
import { Cartouche, ChoixSegmente, Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, trouverMoniteur } from '@/data/depot';
import { compterParJour, joursSemaine, VUES } from '@/features/planning/calendrier';
import { DELAI_ANNULATION_HEURES } from '@/features/planning/creneaux';
import { leconsDeLEleve, leconsDuJour } from '@/features/planning/lecons';
import { formatHeure } from '@/lib/format';
import { usePlanning } from '@/lib/planning';
import { useCalendrier } from '@/lib/use-calendrier';

export default function PlanningEleve() {
  const router = useRouter();
  const { lecons: toutes, leconsAnnulees, maintenant } = usePlanning();
  const cal = useCalendrier(maintenant, 'semaine');
  const { date: jour } = cal;
  const siennes = leconsDeLEleve(toutes, idEleveConnecte());
  const annulees = leconsDeLEleve(leconsAnnulees, idEleveConnecte());
  const ouvrir = (leconId: string) => router.push({ pathname: '/eleve/planning/[leconId]', params: { leconId } });
  const duJour = leconsDuJour(siennes, jour);

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        <ChoixSegmente valeur={cal.vue} options={VUES} onChange={cal.setVue} accessibilityLabel="Affichage du planning" />
        <BarrePeriode titre={cal.titre} onPrecedent={cal.precedent} onSuivant={cal.suivant} onAujourdhui={cal.aujourdhui} />

        {cal.vue === 'jour' ? (
          <Section
            titre="Mes leçons"
            pied={duJour.length > 0 ? `Touche une leçon pour la voir ou l’annuler (jusqu’à ${DELAI_ANNULATION_HEURES} h avant).` : undefined}>
            {duJour.length === 0 ? (
              <Ligne icone="calendrier" titre="Aucune leçon ce jour-là" />
            ) : (
              duJour.map((lecon) => {
                const moniteur = trouverMoniteur(lecon.moniteurId);
                return (
                  <Ligne
                    key={lecon.id}
                    titre={`${formatHeure(lecon.debut)} → ${formatHeure(lecon.fin)}`}
                    sousTitre={`${lecon.lieuDepart.nom}${moniteur ? ` · avec ${moniteur.prenom} ${moniteur.nom}` : ''}`}
                    aDroite={<Cartouche numero={lecon.numero} />}
                    onPress={() => ouvrir(lecon.id)}
                  />
                );
              })
            )}
          </Section>
        ) : null}

        {cal.vue === 'semaine' ? (
          <VueSemaine
            jours={joursSemaine(jour)}
            elements={[
              ...siennes.map((l): ElementCalendrier => ({
              id: l.id,
              debut: l.debut,
              fin: l.fin,
              titre: `L${l.numero}`,
              type: 'lecon' as const,
              onPress: () => ouvrir(l.id),
              accessibilityLabel: `Leçon ${l.numero} à ${formatHeure(l.debut)}`,
              })),
              ...annulees.map((l): ElementCalendrier => ({ id: l.id, debut: l.debut, fin: l.fin, titre: 'Annulée', type: 'annulee', accessibilityLabel: `Leçon annulée à ${formatHeure(l.debut)}` })),
            ]}
            maintenant={maintenant}
            onChoisirJour={cal.ouvrirJour}
          />
        ) : null}
        {cal.vue === 'mois' ? <VueMois date={jour} compte={compterParJour(siennes)} maintenant={maintenant} onChoisirJour={cal.ouvrirJour} /> : null}
        {cal.vue === 'annee' ? (
          <VueAnnee annee={Number(jour.slice(0, 4))} compte={compterParJour(siennes)} maintenant={maintenant} onChoisirMois={cal.ouvrirMois} />
        ) : null}

        <Section pied="Tu choisis l’enseignant, le jour, l’heure et le lieu parmi les créneaux libres de ton auto-école.">
          <Ligne icone="ajouter" titre="Réserver une leçon" onPress={() => router.push('/eleve/planning/reserver')} />
        </Section>
      </Ecran>
    </>
  );
}
