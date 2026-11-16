/**
 * Détail d'une leçon et annulation selon le rôle (règles du client) :
 * l'élève jusqu'à 48 h avant, la direction tant que la leçon n'a pas commencé, l'enseignant jamais.
 * Compte à rebours, prise en charge (avec la consigne), dépôt (même lieu par défaut, modifiable
 * à la demande de l'élève) et accès à la fiche de l'élève pour l'équipe.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Bouton, Cartouche, ChoixMenu, Ecran, EtatVide, Ligne, Section, Texte } from '@/components/ui';
import { lieuxDeRendezVous, trouverEleve, trouverMoniteur } from '@/data/depot';
import { libellesPermis, libellesVehicule, type Lieu } from '@/data/types';
import { DELAI_ANNULATION_HEURES, peutAnnuler, type RolePlanning } from '@/features/planning/creneaux';
import { vehiculePourPermis } from '@/features/planning/vehicules';
import { formatCompteARebours, formatHeure, formatJour } from '@/lib/format';
import { ouvrirItineraire } from '@/lib/itineraire';
import { usePlanning } from '@/lib/planning';
import { useHorloge } from '@/lib/use-horloge';
import { useTheme } from '@/theme/use-theme';

export function EcranDetailLecon({ role }: { role: RolePlanning }) {
  const { leconId } = useLocalSearchParams<{ leconId: string }>();
  const router = useRouter();
  const { espace } = useTheme();
  const { trouverLecon, annuler, modifierDepot, maintenant } = usePlanning();
  const horloge = useHorloge();
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
  const terminee = new Date(lecon.fin) <= horloge;

  // Dépôt : lieux de l'auto-école, le lieu actuel s'il est différent, et le domicile de l'élève.
  const DOMICILE = 'domicile';
  const domicile: Lieu | undefined = eleve ? { nom: eleveVue ? 'Mon domicile' : `Domicile de ${eleve.prenom}`, adresse: eleve.adresse } : undefined;
  const lieuxDepot: Lieu[] = [lecon.lieuDepart, ...lieuxDeRendezVous().filter((l) => l.nom !== lecon.lieuDepart.nom)];
  const valeurDepot = domicile && lecon.lieuFin.adresse === domicile.adresse ? DOMICILE : lecon.lieuFin.nom;
  const optionsDepot = [
    ...lieuxDepot.map((l) => ({ valeur: l.nom, libelle: l.nom === lecon.lieuDepart.nom ? `Même lieu (${l.nom})` : l.nom })),
    ...(domicile ? [{ valeur: DOMICILE, libelle: domicile.nom }] : []),
  ];
  const changerDepot = (valeur: string) => {
    const lieu = valeur === DOMICILE ? domicile : lieuxDepot.find((l) => l.nom === valeur);
    if (lieu) modifierDepot(lecon.id, lieu);
  };
  const memeLieu = lecon.lieuFin.nom === lecon.lieuDepart.nom;
  const cheminFicheEleve = role === 'direction' ? ('/direction/eleves/[id]' as const) : ('/eleves/[id]' as const);

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
          <Texte variante="entete" ton={terminee ? 'secondaire' : 'teinte'} style={{ paddingTop: espace.xs }} accessibilityLiveRegion="polite">
            {formatCompteARebours(lecon.debut, lecon.fin, horloge)}
          </Texte>
        </Section>

        <Section>
          <Ligne
            icone="itineraire"
            titre={`Prise en charge : ${lecon.lieuDepart.nom}`}
            sousTitre={lecon.lieuDepart.adresse}
            onPress={() => ouvrirItineraire(lecon.lieuDepart.adresse)}
            accessibilityHint="Ouvre l’itinéraire dans l’application de cartes"
          />
          {lecon.observation ? <Ligne icone="observation" titre={lecon.observation} sousTitre="Consigne de prise en charge" /> : null}
          {terminee ? (
            <Ligne icone="route" titre={`Dépôt : ${memeLieu ? 'même lieu' : lecon.lieuFin.nom}`} sousTitre={memeLieu ? undefined : lecon.lieuFin.adresse} />
          ) : (
            <Ligne
              icone="route"
              titre="Dépôt"
              sousTitre={memeLieu ? undefined : lecon.lieuFin.adresse}
              aDroite={<ChoixMenu valeur={valeurDepot} options={optionsDepot} onChange={changerDepot} accessibilityLabel="Lieu de dépôt en fin de leçon" />}
            />
          )}
          {eleveVue ? (
            <Ligne icone="eleve" titre={moniteur ? `Avec ${moniteur.prenom} ${moniteur.nom}` : 'Enseignant à confirmer'} />
          ) : (
            <>
              <Ligne
                icone="eleve"
                titre={eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}
                sousTitre={eleve ? `${libellesPermis[eleve.permis]} · ${libellesVehicule[vehiculePourPermis(eleve.permis)].toLowerCase()}` : undefined}
                onPress={eleve ? () => router.push({ pathname: cheminFicheEleve, params: { id: eleve.id } }) : undefined}
                accessibilityHint="Ouvre la fiche de l’élève : progression, dernière leçon, téléphone"
              />
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
