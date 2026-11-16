/**
 * Planning de l'enseignant, en jour / semaine / mois / année :
 * ses leçons (couleur = véhicule), ses créneaux libres, les leçons annulées et ses absences.
 * S'ouvre sur la semaine ; toucher une leçon ouvre son détail (compte à rebours, prise en charge, élève). Vouvoiement.
 */
import { Stack, useRouter } from 'expo-router';

import { BarrePeriode, LegendeCalendrier, VueAnnee, VueMois, VueSemaine, type ElementCalendrier } from '@/components/calendrier';
import { Cartouche, ChoixSegmente, Ecran, Ligne, Section } from '@/components/ui';
import { idMoniteurConnecte, trouverEleve } from '@/data/depot';
import { libellesMotifAbsence } from '@/data/types';
import { compterParJour, joursSemaine, VUES } from '@/features/planning/calendrier';
import { absenceLe, dateLocale } from '@/features/planning/creneaux';
import { leconsDuJour, leconsDuMoniteur } from '@/features/planning/lecons';
import { useCouleursPlanning } from '@/lib/couleurs-planning';
import { formatHeure } from '@/lib/format';
import { usePlanning } from '@/lib/planning';
import { useCalendrier } from '@/lib/use-calendrier';

export default function PlanningEnseignant() {
  const router = useRouter();
  const planning = usePlanning();
  const { maintenant } = planning;
  const moniteurId = idMoniteurConnecte();
  const cal = useCalendrier(maintenant, 'semaine');
  const teintes = useCouleursPlanning();
  const { date: jour } = cal;

  const siennes = leconsDuMoniteur(planning.lecons, moniteurId);
  const dispos = planning.disponibilites(moniteurId);
  const ouvrirLecon = (leconId: string) => router.push({ pathname: '/planning/[leconId]', params: { leconId } });
  const annulees = leconsDuMoniteur(planning.leconsAnnulees, moniteurId);
  const nomCourt = (eleveId: string) => {
    const e = trouverEleve(eleveId);
    return e ? `${e.prenom} ${e.nom.charAt(0)}.` : 'Élève';
  };

  const semaine = joursSemaine(jour);
  const elementsSemaine: ElementCalendrier[] = [
    ...siennes.map((l) => ({
      id: l.id,
      debut: l.debut,
      fin: l.fin,
      titre: nomCourt(l.eleveId),
      type: 'lecon' as const,
      couleur: teintes.couleurVehicule(l),
      onPress: () => ouvrirLecon(l.id),
      accessibilityLabel: `${formatHeure(l.debut)}, ${nomCourt(l.eleveId)}`,
    })),
    ...annulees.map((l) => ({ id: l.id, debut: l.debut, fin: l.fin, titre: `Annulée · ${nomCourt(l.eleveId)}`, type: 'annulee' as const })),
    ...semaine.flatMap((j) =>
      planning.creneauxLibres(moniteurId, j).map((c) => ({ id: `libre-${c.debut}`, debut: c.debut, fin: c.fin, titre: 'libre', type: 'libre' as const })),
    ),
  ];

  const lecons = leconsDuJour(siennes, jour);
  const libres = planning.creneauxLibres(moniteurId, jour);
  const absence = absenceLe(dispos, jour);

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        <ChoixSegmente valeur={cal.vue} options={VUES} onChange={cal.setVue} accessibilityLabel="Affichage du planning" />
        <BarrePeriode titre={cal.titre} onPrecedent={cal.precedent} onSuivant={cal.suivant} onAujourdhui={cal.aujourdhui} />

        {cal.vue === 'jour' ? (
          <>
            {absence ? (
              <Section>
                <Ligne icone="calendrier" titre={`Absent : ${libellesMotifAbsence[absence.motif].toLowerCase()}`} sousTitre="Aucun créneau proposé aux élèves ce jour-là." />
              </Section>
            ) : null}
            <Section titre="Leçons">
              {lecons.length === 0 ? (
                <Ligne titre="Aucune leçon ce jour-là" />
              ) : (
                lecons.map((lecon) => {
                  const eleve = trouverEleve(lecon.eleveId);
                  const terminee = new Date(lecon.fin) <= maintenant;
                  return (
                    <Ligne
                      key={lecon.id}
                      titre={`${formatHeure(lecon.debut)} → ${formatHeure(lecon.fin)} · ${eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}`}
                      sousTitre={`${lecon.lieuDepart.nom}${terminee ? ' · terminée' : ''}`}
                      aDroite={<Cartouche numero={lecon.numero} />}
                      onPress={() => ouvrirLecon(lecon.id)}
                    />
                  );
                })
              )}
            </Section>
            {absence ? null : (
              <Section titre="Créneaux libres" pied="Visibles par les élèves de l’auto-école, qui peuvent les réserver.">
                {libres.length === 0 ? (
                  <Ligne titre="Aucun créneau libre" sousTitre="Ajoutez une ouverture ponctuelle dans vos disponibilités." />
                ) : (
                  libres.map((c) => <Ligne key={c.debut} icone="horloge" titre={`${formatHeure(c.debut)} → ${formatHeure(c.fin)}`} sousTitre="Libre" />)
                )}
              </Section>
            )}
          </>
        ) : null}

        {cal.vue === 'semaine' ? (
          <VueSemaine
            jours={semaine}
            elements={elementsSemaine}
            maintenant={maintenant}
            absents={semaine.filter((j) => absenceLe(dispos, j))}
            onChoisirJour={cal.ouvrirJour}
          />
        ) : null}
        {cal.vue === 'semaine' ? (
          <LegendeCalendrier
            entrees={teintes.legendeVehicules(
              siennes.filter((l) => semaine.includes(dateLocale(l.debut))),
              { libres: true, annulees: annulees.some((l) => semaine.includes(dateLocale(l.debut))) },
            )}
          />
        ) : null}
        {cal.vue === 'mois' ? (
          <VueMois date={jour} compte={compterParJour(siennes)} maintenant={maintenant} onChoisirJour={cal.ouvrirJour} />
        ) : null}
        {cal.vue === 'annee' ? (
          <VueAnnee annee={Number(jour.slice(0, 4))} compte={compterParJour(siennes)} maintenant={maintenant} onChoisirMois={cal.ouvrirMois} />
        ) : null}

        <Section>
          <Ligne
            icone="horloge"
            titre="Mes disponibilités"
            sousTitre="Horaires habituels, ouvertures ponctuelles, absences"
            onPress={() => router.push('/plus/disponibilites')}
          />
        </Section>
      </Ecran>
    </>
  );
}
