/**
 * Planning de toute l'équipe, jour par jour sur deux semaines, depuis le téléphone :
 * leçons, créneaux libres, absences, et modification des disponibilités de chaque enseignant. Vouvoiement.
 */
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { ChoixJour } from '@/components/choix-jour';
import { Cartouche, Ecran, Ligne, Section } from '@/components/ui';
import { listerMoniteurs, trouverEleve } from '@/data/depot';
import { libellesMotifAbsence } from '@/data/types';
import { absenceLe, dateLocale, joursAVenir } from '@/features/planning/creneaux';
import { leconsDuJour } from '@/features/planning/lecons';
import { formatHeure } from '@/lib/format';
import { usePlanning } from '@/lib/planning';

export default function PlanningDirection() {
  const router = useRouter();
  const planning = usePlanning();
  const { maintenant } = planning;
  const jours = joursAVenir(maintenant, 14);
  const [jour, setJour] = useState(() => dateLocale(maintenant));
  const lecons = leconsDuJour(planning.lecons, jour);
  const resume = (j: string) => {
    const n = leconsDuJour(planning.lecons, j).length;
    return n === 0 ? 'aucune leçon' : `${n} leçon${n > 1 ? 's' : ''}`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        <Section>
          <ChoixJour jours={jours} valeur={jour} onChange={setJour} maintenant={maintenant} resume={resume} />
        </Section>

        {listerMoniteurs().map((moniteur) => {
          const siennes = lecons.filter((l) => l.moniteurId === moniteur.id);
          const absence = absenceLe(planning.disponibilites(moniteur.id), jour);
          const libres = absence ? 0 : planning.creneauxLibres(moniteur.id, jour).length;
          return (
            <Section key={moniteur.id} titre={`${moniteur.prenom} ${moniteur.nom}`}>
              {absence ? (
                <Ligne icone="calendrier" titre={`Absent : ${libellesMotifAbsence[absence.motif].toLowerCase()}`} />
              ) : null}
              {siennes.map((lecon) => {
                const eleve = trouverEleve(lecon.eleveId);
                const terminee = new Date(lecon.fin) <= maintenant;
                return (
                  <Ligne
                    key={lecon.id}
                    titre={`${formatHeure(lecon.debut)} → ${formatHeure(lecon.fin)} · ${eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}`}
                    sousTitre={`${lecon.lieuDepart.nom}${terminee ? ' · terminée' : ''}`}
                    aDroite={<Cartouche numero={lecon.numero} />}
                    onPress={() => router.push({ pathname: '/direction/planning/[leconId]', params: { leconId: lecon.id } })}
                  />
                );
              })}
              {siennes.length === 0 && !absence ? <Ligne titre="Aucune leçon" /> : null}
              {absence ? null : (
                <Ligne
                  icone="horloge"
                  titre={libres === 0 ? 'Aucun créneau libre' : `${libres} créneau${libres > 1 ? 'x' : ''} libre${libres > 1 ? 's' : ''}`}
                  sousTitre="Modifier les disponibilités"
                  onPress={() =>
                    router.push({ pathname: '/direction/planning/disponibilites', params: { moniteurId: moniteur.id } })
                  }
                />
              )}
            </Section>
          );
        })}
      </Ecran>
    </>
  );
}
