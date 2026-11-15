/** Réservation d'une leçon : l'élève choisit un jour et un enseignant, puis un créneau libre. Tutoiement. */
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { ChoixJour } from '@/components/choix-jour';
import { ChoixMenu, Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, listerMoniteurs, trouverEleve, trouverMoniteur } from '@/data/depot';
import { joursAVenir, type Creneau } from '@/features/planning/creneaux';
import { leconsDeLEleve } from '@/features/planning/lecons';
import { formatHeure } from '@/lib/format';
import { usePlanning } from '@/lib/planning';

const TOUS = 'tous';
const FAVORIS = 'favoris';

export default function ReserverLecon() {
  const router = useRouter();
  const planning = usePlanning();
  const { maintenant } = planning;
  const eleve = trouverEleve(idEleveConnecte());
  const favoris = eleve?.moniteursFavorisIds ?? [];
  const [filtre, setFiltre] = useState<string>(favoris.length > 0 ? FAVORIS : TOUS);
  const jours = joursAVenir(maintenant, 14);

  const moniteurs = listerMoniteurs().filter((m) =>
    filtre === TOUS ? true : filtre === FAVORIS ? favoris.includes(m.id) : m.id === filtre,
  );
  // Pas deux leçons en même temps pour l'élève.
  const siennes = leconsDeLEleve(planning.lecons, eleve?.id ?? '');
  const libresLe = (jour: string): Creneau[] =>
    moniteurs
      .flatMap((m) => planning.creneauxLibres(m.id, jour))
      .filter((c) => !siennes.some((l) => l.debut < c.fin && c.debut < l.fin))
      .sort((a, b) => a.debut.localeCompare(b.debut) || a.moniteurId.localeCompare(b.moniteurId));

  const premierJourLibre = jours.find((j) => libresLe(j).length > 0) ?? jours[0];
  const [jourChoisi, setJour] = useState<string | null>(null);
  const jour = jourChoisi ?? premierJourLibre;
  const creneaux = libresLe(jour);

  const options = [
    ...(favoris.length > 0 ? [{ valeur: FAVORIS, libelle: 'Mes enseignants favoris' }] : []),
    { valeur: TOUS, libelle: 'Tous les enseignants' },
    ...listerMoniteurs().map((m) => ({ valeur: m.id, libelle: `${m.prenom} ${m.nom}` })),
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Réserver', headerLargeTitle: false }} />
      <Ecran>
        <Section>
          <Ligne
            icone="eleve"
            titre="Enseignant"
            aDroite={<ChoixMenu valeur={filtre} options={options} onChange={setFiltre} accessibilityLabel="Enseignant" />}
          />
          <ChoixJour
            jours={jours}
            valeur={jour}
            onChange={setJour}
            maintenant={maintenant}
            resume={(j) => {
              const n = libresLe(j).length;
              return n === 0 ? 'aucun créneau' : `${n} créneau${n > 1 ? 'x' : ''}`;
            }}
          />
        </Section>

        <Section titre="Créneaux libres" pied="Leçon d’une heure. Tu choisiras ensuite le lieu de rendez-vous.">
          {creneaux.length === 0 ? (
            <Ligne
              icone="calendrier"
              titre="Aucun créneau libre ce jour-là"
              sousTitre={filtre === FAVORIS ? 'Essaie un autre jour, ou « Tous les enseignants ».' : 'Essaie un autre jour.'}
            />
          ) : (
            creneaux.map((c) => {
              const moniteur = trouverMoniteur(c.moniteurId);
              return (
                <Ligne
                  key={`${c.moniteurId}-${c.debut}`}
                  icone="horloge"
                  titre={`${formatHeure(c.debut)} → ${formatHeure(c.fin)}`}
                  sousTitre={`avec ${moniteur ? `${moniteur.prenom} ${moniteur.nom}` : 'un enseignant'}${favoris.includes(c.moniteurId) ? ' · ton favori' : ''}`}
                  onPress={() =>
                    router.push({
                      pathname: '/eleve/planning/confirmer',
                      params: { moniteurId: c.moniteurId, debut: c.debut, fin: c.fin },
                    })
                  }
                />
              );
            })
          )}
        </Section>
      </Ecran>
    </>
  );
}
