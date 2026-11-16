/**
 * ÉCRAN DE RÉFÉRENCE — fiche élève vue par l'enseignant et par la direction.
 * Le dossier (pièces, relances) et les messages ne sont visibles que par la direction.
 * Sert de modèle pour tous les écrans : composants `@/components/ui`,
 * données via `@/data/depot`, formats via `@/lib/format`, aucun style en dur.
 */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

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
import { DetailFiche } from '@/components/detail-fiche';
import { trouverCours, trouverEleve, trouverMoniteur } from '@/data/depot';
import { leconsEffectuees, prochaineLecon } from '@/features/planning/lecons';
import { libellesPermis } from '@/data/types';
import { alerteEnseignant } from '@/features/cours/alertes';
import { meilleurScore } from '@/features/cours/quiz';
import { dernierSignalement } from '@/features/fiches/fiche';
import { formatDans, formatDateCourte, formatHeure, formatJour, formatPiecesManquantes } from '@/lib/format';
import { useCoursAReproposer, useFichesDeLEleve, useProgressionEleve } from '@/lib/fiches-lecon';
import { ouvrirItineraire } from '@/lib/itineraire';
import { usePlanning } from '@/lib/planning';
import { useSuiviCours } from '@/lib/suivi-cours';
import { useDossier } from '@/lib/dossier';
import { useVerificationsEleve } from '@/lib/verifications';
import { useTheme } from '@/theme/use-theme';

export function EcranFicheEleve({ vue }: { vue: 'enseignant' | 'direction' }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dossier = useDossier();
  const verifications = useVerificationsEleve(trouverEleve(id));
  const { espace, couleurs } = useTheme();
  const eleve = trouverEleve(id);
  const { lecons: toutes, maintenant } = usePlanning();
  const lecon = eleve ? prochaineLecon(toutes, eleve.id, maintenant) : undefined;
  const cours = trouverCours(lecon?.cours?.coursId);
  const { suivi } = useSuiviCours(eleve?.id ?? '', cours?.id);
  const fiches = useFichesDeLEleve(eleve?.id ?? '');
  const progression = useProgressionEleve(eleve);
  const aRevoir = useCoursAReproposer(eleve?.id ?? '', cours?.id);

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

  const effectuees = leconsEffectuees(toutes, eleve.id, maintenant);
  const derniereFiche = fiches[0];
  const signalement = dernierSignalement(fiches);
  const auteurSignalement = signalement ? trouverMoniteur(signalement.enseignantId) : undefined;
  const alerteCours = cours && suivi && lecon?.cours ? alerteEnseignant(cours, suivi, lecon.cours.envoyeLe) : null;
  const meilleur = suivi ? meilleurScore(suivi) : null;

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

        {signalement ? (
          <Section titre="Signalement de l’équipe" forme="libre">
            <NoteAttention
              titre={`Signalé le ${formatDateCourte(signalement.date)}${auteurSignalement ? ` par ${auteurSignalement.prenom} ${auteurSignalement.nom}` : ''} · L${signalement.numeroLecon}`}
              preuve={signalement.observationInterne}
            />
          </Section>
        ) : null}

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
            {alerteCours ? <NoteAttention titre={alerteCours.titre} preuve={alerteCours.preuve} /> : null}
          </Section>
        ) : null}

        {cours && suivi?.statut === 'valide' ? (
          <Section titre="Cours avant la leçon">
            <Ligne
              icone="valider"
              titre={`Cours validé : ${cours.titre}`}
              sousTitre={meilleur ? `Meilleur score ${meilleur.score}/${meilleur.total} · ${suivi.tentatives.length} tentative${suivi.tentatives.length > 1 ? 's' : ''}` : undefined}
            />
          </Section>
        ) : null}

        <Section titre="Progression" forme="libre">
          <BandeProgression etapes={progression} />
        </Section>

        {aRevoir.length > 0 ? (
          <Section titre="Cours reproposés à l’élève" pied="Après une appréciation « non maîtrisé ». L’élève les voit sur son accueil.">
            {aRevoir.map(({ cours: c, motif, sousCompetence }) => (
              <Ligne
                key={c.id}
                icone="cours"
                titre={c.titre}
                sousTitre={`Non maîtrisé en L${motif.numeroLecon} · ${sousCompetence?.libelle ?? motif.sousCompetenceId}`}
              />
            ))}
          </Section>
        ) : null}

        {derniereFiche ? (
          <DetailFiche vue="equipe" fiche={derniereFiche} titre={`Dernière leçon · L${derniereFiche.numeroLecon} · ${formatDateCourte(derniereFiche.date)}`} />
        ) : (
          <Section titre="Dernière leçon">
            <Ligne icone="observation" titre="Aucune fiche de leçon pour l’instant" />
          </Section>
        )}

        <Section titre={vue === 'direction' ? 'Dossier' : 'Suivi'}>
          {vue === 'direction' ? (
            <>
              <Ligne
                icone="document"
                titre="Pièces et relances"
                sousTitre={formatPiecesManquantes(dossier.piecesManquantes(eleve.id).length)}
                sousTitreAlerte={dossier.piecesManquantes(eleve.id).length > 0}
                onPress={() => router.push({ pathname: '/direction/eleves/dossier', params: { id: eleve.id } })}
              />
              <Ligne
                icone="message"
                titre="Messages"
                sousTitre={dossier.nonLus(eleve.id, 'direction') > 0 ? `${dossier.nonLus(eleve.id, 'direction')} non lu${dossier.nonLus(eleve.id, 'direction') > 1 ? 's' : ''}` : undefined}
                sousTitreAlerte={dossier.nonLus(eleve.id, 'direction') > 0}
                onPress={() => router.push({ pathname: '/direction/eleves/conversation', params: { eleveId: eleve.id } })}
              />
            </>
          ) : null}
          <Ligne icone="livret" titre="Livret d’apprentissage" onPress={() => {}} />
          <Ligne
            icone="voiture"
            titre="Vérifications intérieures et extérieures"
            sousTitre={
              verifications.c1Acquise
                ? `Ouvertes (C1 acquise) · ${verifications.maitrisees.length} fiches maîtrisées`
                : verifications.debloqueeParEnseignant
                  ? `Ouvertes avant la fin de C1 · ${verifications.maitrisees.length} fiches maîtrisées`
                  : 'Fermées jusqu’à la fin de C1'
            }
            aDroite={
              verifications.c1Acquise ? undefined : (
                <Switch
                  value={verifications.debloqueeParEnseignant}
                  onValueChange={verifications.basculerDeblocage}
                  trackColor={{ false: couleurs.separateur, true: couleurs.teinte }}
                  ios_backgroundColor={couleurs.separateur}
                  accessibilityLabel="Ouvrir les vérifications à l’élève"
                />
              )
            }
          />
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
