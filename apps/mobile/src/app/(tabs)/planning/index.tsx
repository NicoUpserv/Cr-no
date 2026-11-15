/** Planning de l'enseignant : ses leçons et ses créneaux libres, jour par jour sur deux semaines. Vouvoiement. */
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { ChoixJour } from '@/components/choix-jour';
import { Cartouche, Ecran, Ligne, Section } from '@/components/ui';
import { idMoniteurConnecte, trouverEleve } from '@/data/depot';
import { libellesMotifAbsence } from '@/data/types';
import { absenceLe, dateLocale, joursAVenir } from '@/features/planning/creneaux';
import { leconsDuJour, leconsDuMoniteur } from '@/features/planning/lecons';
import { formatHeure } from '@/lib/format';
import { usePlanning } from '@/lib/planning';

export default function PlanningEnseignant() {
  const router = useRouter();
  const planning = usePlanning();
  const { maintenant } = planning;
  const moniteurId = idMoniteurConnecte();
  const jours = joursAVenir(maintenant, 14);
  const [jour, setJour] = useState(() => dateLocale(maintenant));

  const siennes = leconsDuMoniteur(planning.lecons, moniteurId);
  const lecons = leconsDuJour(siennes, jour);
  const libres = planning.creneauxLibres(moniteurId, jour);
  const absence = absenceLe(planning.disponibilites(moniteurId), jour);
  const resume = (j: string) => {
    const n = leconsDuJour(siennes, j).length;
    return n === 0 ? 'aucune leçon' : `${n} leçon${n > 1 ? 's' : ''}`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      <Ecran>
        <Section>
          <ChoixJour jours={jours} valeur={jour} onChange={setJour} maintenant={maintenant} resume={resume} />
        </Section>

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
                  onPress={() => router.push({ pathname: '/eleves/[id]', params: { id: lecon.eleveId } })}
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
              libres.map((c) => (
                <Ligne key={c.debut} icone="horloge" titre={`${formatHeure(c.debut)} → ${formatHeure(c.fin)}`} sousTitre="Libre" />
              ))
            )}
          </Section>
        )}

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
