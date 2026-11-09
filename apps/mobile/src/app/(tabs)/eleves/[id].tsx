/**
 * ÉCRAN DE RÉFÉRENCE — fiche élève vue par l'enseignant.
 * Sert de modèle pour tous les écrans : composants `@/components/ui`,
 * données via `@/data/depot`, formats via `@/lib/format`, aucun style en dur.
 */
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  BandeProgression,
  Cartouche,
  Ecran,
  EtatVide,
  Ligne,
  NoteAttention,
  PanneauDirection,
  Section,
  Texte,
} from '@/components/ui';
import { leconsEffectuees, observationsDeLEleve, prochaineLecon, trouverEleve } from '@/data/depot';
import { libellesPermis } from '@/data/types';
import { formatDans, formatDateCourte, formatFois, formatHeure, formatJour, formatPiecesManquantes } from '@/lib/format';
import { ouvrirItineraire } from '@/lib/itineraire';
import { useTheme } from '@/theme/use-theme';

export default function FicheEleve() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { espace } = useTheme();
  const eleve = trouverEleve(id);

  if (!eleve) {
    return (
      <>
        <Stack.Screen options={{ title: 'Élève introuvable', headerLargeTitle: false }} />
        <EtatVide
          icone="document"
          titre="Élève introuvable"
          message="Cette fiche n’existe plus ou a été déplacée. Revenez à la liste des élèves."
        />
      </>
    );
  }

  const maintenant = new Date();
  const lecon = prochaineLecon(eleve.id, maintenant);
  const effectuees = leconsEffectuees(eleve.id, maintenant);
  const observations = observationsDeLEleve(eleve.id);
  const derniere = observations[0];
  const coursNonConsulte = lecon?.cours && lecon.cours.ouvertures === 0 ? lecon.cours : undefined;

  return (
    <>
      <Stack.Screen options={{ title: `${eleve.prenom} ${eleve.nom}` }} />
      <Ecran>
        <View style={[styles.resume, { paddingHorizontal: espace.xl, gap: espace.s }]}>
          <Texte variante="legende" ton="secondaire">
            {libellesPermis[eleve.permis]}
          </Texte>
          {lecon ? <Cartouche numero={lecon.numero} /> : null}
          <Texte variante="legende" ton="secondaire" tabulaire>
            {lecon ? `sur ${eleve.forfaitLecons}` : `${effectuees} leçons sur ${eleve.forfaitLecons}`}
          </Texte>
        </View>

        {lecon ? (
          <Section titre="Prochaine leçon" forme="libre">
            <PanneauDirection
              lieuDepart={lecon.lieuDepart.nom}
              heureDebut={formatHeure(lecon.debut)}
              lieuFin={lecon.lieuFin.nom}
              heureFin={formatHeure(lecon.fin)}
              quand={`${formatJour(lecon.debut, maintenant)} · ${formatDans(lecon.debut, lecon.fin, maintenant)}`}
              onItineraire={() => ouvrirItineraire(lecon.lieuDepart.adresse)}
            />
            {coursNonConsulte ? (
              <NoteAttention
                titre={`Cours non consulté : ${coursNonConsulte.titre}`}
                preuve={`Envoyé le ${formatDateCourte(coursNonConsulte.envoyeLe)} · ouvert ${formatFois(coursNonConsulte.ouvertures)}`}
              />
            ) : null}
          </Section>
        ) : null}

        <Section titre="Progression" forme="libre">
          <BandeProgression
            etapes={eleve.competences.map((c) => ({
              code: c.code,
              libelle: c.libelle,
              acquises: c.sousCompetencesAcquises,
              total: c.sousCompetencesTotal,
            }))}
          />
        </Section>

        <Section titre="Dossier">
          <Ligne
            icone="document"
            titre="Pièces du dossier"
            sousTitre={formatPiecesManquantes(eleve.piecesManquantes.length)}
            sousTitreAlerte={eleve.piecesManquantes.length > 0}
            onPress={() => {}}
          />
          <Ligne
            icone="observation"
            titre="Observations"
            sousTitre={
              derniere
                ? `Dernière le ${formatDateCourte(derniere.date)} · ${derniere.visibleParEleve ? 'visible par l’élève' : 'réservée aux enseignants'}`
                : 'Aucune observation'
            }
            onPress={() => {}}
          />
          <Ligne icone="livret" titre="Livret d’apprentissage" onPress={() => {}} />
          <Ligne icone="telephone" titre="Appeler" sousTitre={eleve.telephone} onPress={() => {}} />
        </Section>
      </Ecran>
    </>
  );
}

const styles = StyleSheet.create({
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
