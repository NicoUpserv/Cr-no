/**
 * Détail d'une leçon et annulation selon le rôle (règles du client) :
 * l'élève jusqu'à 48 h avant, la direction tant que la leçon n'a pas commencé, l'enseignant jamais.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Bouton, Cartouche, Ecran, EtatVide, Ligne, Section, Texte } from '@/components/ui';
import { trouverEleve, trouverMoniteur } from '@/data/depot';
import { DELAI_ANNULATION_HEURES, peutAnnuler, type RolePlanning } from '@/features/planning/creneaux';
import { formatHeure, formatJour } from '@/lib/format';
import { ouvrirItineraire } from '@/lib/itineraire';
import { usePlanning } from '@/lib/planning';
import { useTheme } from '@/theme/use-theme';

export function EcranDetailLecon({ role }: { role: RolePlanning }) {
  const { leconId } = useLocalSearchParams<{ leconId: string }>();
  const router = useRouter();
  const { espace } = useTheme();
  const { trouverLecon, annuler, maintenant } = usePlanning();
  const [confirmation, setConfirmation] = useState(false);
  const lecon = trouverLecon(leconId);
  const eleveVue = role === 'eleve';

  if (!lecon) {
    return (
      <>
        <Stack.Screen options={{ title: 'Leçon', headerLargeTitle: false }} />
        <EtatVide icone="calendrier" titre="Leçon introuvable" message="Cette leçon a été annulée ou n’existe plus." />
      </>
    );
  }

  const eleve = trouverEleve(lecon.eleveId);
  const moniteur = trouverMoniteur(lecon.moniteurId);
  const annulable = peutAnnuler(lecon, role, maintenant);
  const commencee = new Date(lecon.debut) <= maintenant;

  const regle = eleveVue
    ? annulable
      ? `Annulation possible jusqu’à ${DELAI_ANNULATION_HEURES} h avant la leçon.`
      : commencee
        ? undefined
        : `Moins de ${DELAI_ANNULATION_HEURES} h avant la leçon : pour annuler, contacte l’auto-école.`
    : role === 'direction'
      ? annulable
        ? 'L’élève sera prévenu par e-mail (envoi pas encore actif dans la démo).'
        : undefined
      : 'Seule la direction peut retirer un élève d’une leçon.';

  const confirmerAnnulation = () => {
    annuler(lecon.id);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Leçon', headerLargeTitle: false }} />
      <Ecran>
        <Section forme="libre">
          <View style={[styles.enTete, { gap: espace.s }]}>
            <Cartouche numero={lecon.numero} />
            <Texte variante="titre3">
              {formatJour(lecon.debut, maintenant)} · {formatHeure(lecon.debut)} → {formatHeure(lecon.fin)}
            </Texte>
          </View>
        </Section>

        <Section>
          <Ligne
            icone="itineraire"
            titre={`Départ : ${lecon.lieuDepart.nom}`}
            sousTitre={lecon.lieuDepart.adresse}
            onPress={() => ouvrirItineraire(lecon.lieuDepart.adresse)}
            accessibilityHint="Ouvre l’itinéraire dans l’application de cartes"
          />
          {lecon.lieuFin.nom !== lecon.lieuDepart.nom ? <Ligne icone="route" titre={`Fin : ${lecon.lieuFin.nom}`} sousTitre={lecon.lieuFin.adresse} /> : null}
          {eleveVue ? (
            <Ligne icone="eleve" titre={moniteur ? `Avec ${moniteur.prenom} ${moniteur.nom}` : 'Enseignant à confirmer'} />
          ) : (
            <>
              <Ligne icone="eleve" titre={eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'} sousTitre="Élève" />
              <Ligne icone="equipe" titre={moniteur ? `${moniteur.prenom} ${moniteur.nom}` : 'Enseignant'} sousTitre="Enseignant" />
            </>
          )}
        </Section>

        {regle ? (
          <Section pied={regle} forme="libre">
            {null}
          </Section>
        ) : null}

        {annulable ? (
          <View style={{ paddingTop: espace.xl, gap: espace.s }}>
            {confirmation ? (
              <>
                <Bouton titre="Oui, annuler la leçon" onPress={confirmerAnnulation} />
                <Bouton titre="Garder la leçon" variante="secondaire" onPress={() => setConfirmation(false)} />
              </>
            ) : (
              <Bouton titre="Annuler la leçon" variante="secondaire" onPress={() => setConfirmation(true)} />
            )}
          </View>
        ) : null}
      </Ecran>
    </>
  );
}

const styles = StyleSheet.create({
  enTete: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
