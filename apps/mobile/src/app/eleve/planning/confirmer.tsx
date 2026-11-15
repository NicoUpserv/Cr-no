/** Confirmation d'une réservation : récapitulatif, lieu de rendez-vous, règle d'annulation. Tutoiement. */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Bouton, ChoixMenu, Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, lieuxDeRendezVous, trouverMoniteur } from '@/data/depot';
import { DELAI_ANNULATION_HEURES } from '@/features/planning/creneaux';
import { formatHeure, formatJour } from '@/lib/format';
import { usePlanning } from '@/lib/planning';
import { useTheme } from '@/theme/use-theme';

export default function ConfirmerReservation() {
  const { moniteurId, debut, fin } = useLocalSearchParams<{ moniteurId: string; debut: string; fin: string }>();
  const router = useRouter();
  const { espace } = useTheme();
  const { reserver, maintenant } = usePlanning();
  const lieux = lieuxDeRendezVous();
  const [lieuNom, setLieuNom] = useState(lieux[0]?.nom ?? '');
  const [pris, setPris] = useState(false);
  const moniteur = trouverMoniteur(moniteurId);
  const lieu = lieux.find((l) => l.nom === lieuNom) ?? lieux[0];

  const confirmer = () => {
    const id = reserver({ moniteurId, debut, fin }, idEleveConnecte(), lieu);
    if (!id) {
      setPris(true);
      return;
    }
    router.dismissTo('/eleve/planning');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Confirmer', headerLargeTitle: false }} />
      <Ecran>
        <Section titre="Ta leçon">
          <Ligne icone="calendrier" titre={`${formatJour(debut, maintenant)} · ${formatHeure(debut)} → ${formatHeure(fin)}`} />
          <Ligne icone="eleve" titre={moniteur ? `Avec ${moniteur.prenom} ${moniteur.nom}` : 'Enseignant'} />
          <Ligne
            icone="itineraire"
            titre="Rendez-vous"
            sousTitre={lieu?.adresse}
            aDroite={
              <ChoixMenu
                valeur={lieuNom}
                options={lieux.map((l) => ({ valeur: l.nom, libelle: l.nom }))}
                onChange={setLieuNom}
                accessibilityLabel="Lieu de rendez-vous"
              />
            }
          />
        </Section>

        {pris ? (
          <Section>
            <Ligne
              icone="attention"
              titre="Ce créneau n’est plus libre"
              sousTitre="Quelqu’un vient de le réserver. Reviens en arrière et choisis-en un autre."
              sousTitreAlerte
            />
          </Section>
        ) : null}

        <Section pied={`Annulation possible jusqu’à ${DELAI_ANNULATION_HEURES} h avant la leçon. Ensuite, contacte l’auto-école.`} forme="libre">
          {null}
        </Section>
        <View style={{ paddingTop: espace.s }}>
          <Bouton titre="Confirmer la réservation" onPress={confirmer} />
        </View>
      </Ecran>
    </>
  );
}
