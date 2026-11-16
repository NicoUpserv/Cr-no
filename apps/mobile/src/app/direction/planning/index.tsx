/**
 * Planning de l'équipe depuis le téléphone, en jour / semaine / mois / année :
 * leçons, créneaux libres, absences, et modification des disponibilités de chaque enseignant.
 * Code couleur au choix : par enseignant ou par véhicule (boîte manuelle, automatique, moto, remorque). Vouvoiement.
 */
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { BarrePeriode, LegendeCalendrier, VueAnnee, VueMois, VueSemaine, type ElementCalendrier } from '@/components/calendrier';
import { Cartouche, ChoixMenu, ChoixSegmente, Ecran, Ligne, Section } from '@/components/ui';
import { listerMoniteurs, trouverEleve, trouverMoniteur } from '@/data/depot';
import { libellesMotifAbsence } from '@/data/types';
import { compterParJour, joursSemaine, VUES } from '@/features/planning/calendrier';
import { absenceLe, dateLocale } from '@/features/planning/creneaux';
import { leconsDuJour } from '@/features/planning/lecons';
import { initiales } from '@/features/planning/vehicules';
import { useCouleursPlanning } from '@/lib/couleurs-planning';
import { formatHeure } from '@/lib/format';
import { usePlanning } from '@/lib/planning';
import { useCalendrier } from '@/lib/use-calendrier';

const EQUIPE = 'equipe';
type ModeCouleur = 'enseignant' | 'vehicule';
const OPTIONS_COULEUR: { valeur: ModeCouleur; libelle: string }[] = [
  { valeur: 'enseignant', libelle: 'Par enseignant' },
  { valeur: 'vehicule', libelle: 'Par véhicule' },
];

export default function PlanningDirection() {
  const router = useRouter();
  const planning = usePlanning();
  const { maintenant } = planning;
  const cal = useCalendrier(maintenant);
  const { date: jour } = cal;
  const [filtre, setFiltre] = useState<string>(EQUIPE);
  const [modeCouleur, setModeCouleur] = useState<ModeCouleur>('enseignant');
  const teintes = useCouleursPlanning();

  const moniteurs = listerMoniteurs().filter((m) => filtre === EQUIPE || m.id === filtre);
  const ids = moniteurs.map((m) => m.id);
  const lecons = planning.lecons.filter((l) => ids.includes(l.moniteurId));
  const ouvrirLecon = (leconId: string) => router.push({ pathname: '/direction/planning/[leconId]', params: { leconId } });
  const nomCourt = (eleveId: string) => trouverEleve(eleveId)?.prenom ?? 'Élève';

  const semaine = joursSemaine(jour);
  const unSeul = moniteurs.length === 1 ? moniteurs[0] : undefined;
  // Un seul enseignant affiché : la couleur par enseignant n'apporterait rien, on colore par véhicule.
  const parEnseignant = !unSeul && modeCouleur === 'enseignant';
  const annulees = planning.leconsAnnulees.filter((l) => ids.includes(l.moniteurId));
  const dansLaSemaine = (l: { debut: string }) => semaine.includes(dateLocale(l.debut));
  const elementsSemaine: ElementCalendrier[] = [
    ...lecons.map((l) => ({
      id: l.id,
      debut: l.debut,
      fin: l.fin,
      // Toute l'équipe : initiales de l'enseignant + prénom de l'élève.
      titre: unSeul ? nomCourt(l.eleveId) : `${initiales(trouverMoniteur(l.moniteurId))} ${nomCourt(l.eleveId)}`,
      type: 'lecon' as const,
      couleur: parEnseignant ? teintes.couleurEnseignant(l.moniteurId) : teintes.couleurVehicule(l),
      onPress: () => ouvrirLecon(l.id),
    })),
    ...annulees.map((l) => ({ id: l.id, debut: l.debut, fin: l.fin, titre: `Annulée · ${nomCourt(l.eleveId)}`, type: 'annulee' as const })),
    // Créneaux libres seulement pour un enseignant choisi (sinon la semaine devient illisible).
    ...(unSeul
      ? semaine.flatMap((j) =>
          planning.creneauxLibres(unSeul.id, j).map((c) => ({ id: `libre-${c.debut}`, debut: c.debut, fin: c.fin, titre: 'libre', type: 'libre' as const })),
        )
      : []),
  ];

  const options = [
    { valeur: EQUIPE, libelle: 'Toute l’équipe' },
    ...listerMoniteurs().map((m) => ({ valeur: m.id, libelle: `${m.prenom} ${m.nom}` })),
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        <ChoixSegmente valeur={cal.vue} options={VUES} onChange={cal.setVue} accessibilityLabel="Affichage du planning" />
        <Section>
          <Ligne icone="equipe" titre="Enseignant" aDroite={<ChoixMenu valeur={filtre} options={options} onChange={setFiltre} accessibilityLabel="Enseignant affiché" />} />
          {cal.vue === 'semaine' && !unSeul ? (
            <Ligne
              icone="calendrier"
              titre="Couleurs"
              aDroite={<ChoixMenu valeur={modeCouleur} options={OPTIONS_COULEUR} onChange={setModeCouleur} accessibilityLabel="Code couleur du planning" />}
            />
          ) : null}
        </Section>
        <BarrePeriode titre={cal.titre} onPrecedent={cal.precedent} onSuivant={cal.suivant} onAujourdhui={cal.aujourdhui} />

        {cal.vue === 'jour'
          ? moniteurs.map((moniteur) => {
              const siennes = leconsDuJour(lecons, jour).filter((l) => l.moniteurId === moniteur.id);
              const absence = absenceLe(planning.disponibilites(moniteur.id), jour);
              const libres = absence ? 0 : planning.creneauxLibres(moniteur.id, jour).length;
              return (
                <Section key={moniteur.id} titre={`${moniteur.prenom} ${moniteur.nom}`}>
                  {absence ? <Ligne icone="calendrier" titre={`Absent : ${libellesMotifAbsence[absence.motif].toLowerCase()}`} /> : null}
                  {siennes.map((lecon) => {
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
                  })}
                  {siennes.length === 0 && !absence ? <Ligne titre="Aucune leçon" /> : null}
                  {absence ? null : (
                    <Ligne
                      icone="horloge"
                      titre={libres === 0 ? 'Aucun créneau libre' : `${libres} créneau${libres > 1 ? 'x' : ''} libre${libres > 1 ? 's' : ''}`}
                      sousTitre="Modifier les disponibilités"
                      onPress={() => router.push({ pathname: '/direction/planning/disponibilites', params: { moniteurId: moniteur.id } })}
                    />
                  )}
                </Section>
              );
            })
          : null}

        {cal.vue === 'semaine' ? (
          <VueSemaine
            jours={semaine}
            elements={elementsSemaine}
            maintenant={maintenant}
            absents={unSeul ? semaine.filter((j) => absenceLe(planning.disponibilites(unSeul.id), j)) : []}
            onChoisirJour={cal.ouvrirJour}
          />
        ) : null}
        {cal.vue === 'semaine' ? (
          <LegendeCalendrier
            entrees={
              parEnseignant
                ? teintes.legendeEnseignants(moniteurs, { annulees: annulees.some(dansLaSemaine) })
                : teintes.legendeVehicules(lecons.filter(dansLaSemaine), { libres: Boolean(unSeul), annulees: annulees.some(dansLaSemaine) })
            }
          />
        ) : null}
        {cal.vue === 'mois' ? <VueMois date={jour} compte={compterParJour(lecons)} maintenant={maintenant} onChoisirJour={cal.ouvrirJour} /> : null}
        {cal.vue === 'annee' ? (
          <VueAnnee annee={Number(jour.slice(0, 4))} compte={compterParJour(lecons)} maintenant={maintenant} onChoisirMois={cal.ouvrirMois} />
        ) : null}

        {cal.vue === 'semaine' && !unSeul ? (
          <Section pied="Dans chaque leçon : initiales de l’enseignant, puis prénom de l’élève. Choisissez un enseignant pour voir aussi ses créneaux libres." forme="libre">
            {null}
          </Section>
        ) : null}
      </Ecran>
    </>
  );
}
