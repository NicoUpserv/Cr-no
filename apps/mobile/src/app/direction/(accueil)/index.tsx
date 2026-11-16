/** Accueil de la direction : ce qui demande une décision, puis la journée. Vouvoiement. */
import { Stack, useRouter } from 'expo-router';
import { DemandesAbsence } from '@/components/demandes-absence';
import { DocumentsAVerifier } from '@/components/documents-a-verifier';
import { Ecran, Ligne, Section } from '@/components/ui';
import {
  elevesPretsPourLExamen,
  infosAutoEcole,
  listerMoniteurs,
  trouverEleve,
  trouverMoniteur,
} from '@/data/depot';
import { dernierSignalement } from '@/features/fiches/fiche';
import { useDossier } from '@/lib/dossier';
import { formatDateCourte, formatHeure } from '@/lib/format';
import { dateLocale } from '@/features/planning/creneaux';
import { leconsDuJour } from '@/features/planning/lecons';
import { useFichesEquipe } from '@/lib/fiches-lecon';
import { usePlanning } from '@/lib/planning';

export default function AccueilDirection() {
  const router = useRouter();
  const { lecons: toutes, maintenant } = usePlanning();
  const { fiches } = useFichesEquipe();
  // Le signalement le plus récent de chaque élève.
  const signalements = [...new Set(fiches.map((f) => f.eleveId))].flatMap((eleveId) => {
    const s = dernierSignalement(fiches.filter((f) => f.eleveId === eleveId));
    return s ? [s] : [];
  });
  const dossier = useDossier();
  const nonLus = dossier.conversations().reduce((n, c) => n + dossier.nonLus(c.eleveId, 'direction'), 0);
  const prets = elevesPretsPourLExamen();
  const lecons = leconsDuJour(toutes, dateLocale(maintenant));

  return (
    <>
      <Stack.Screen options={{ title: infosAutoEcole().nom }} />
      <Ecran>
        <Section>
          <Ligne
            icone="message"
            titre="Messages des élèves"
            sousTitre={nonLus > 0 ? `${nonLus} message${nonLus > 1 ? 's' : ''} non lu${nonLus > 1 ? 's' : ''}` : 'Aucun message non lu'}
            sousTitreAlerte={nonLus > 0}
            onPress={() => router.push('/direction/messages')}
          />
        </Section>

        {signalements.length > 0 ? (
          <Section titre="Signalements de l’équipe" pied="Observations internes marquées « À signaler » par un enseignant.">
            {signalements.map((s) => {
              const eleve = trouverEleve(s.eleveId);
              const auteur = trouverMoniteur(s.enseignantId);
              return (
                <Ligne
                  key={s.leconId}
                  icone="attention"
                  titre={`${eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'} · L${s.numeroLecon}`}
                  sousTitre={`${s.observationInterne} (${auteur ? `${auteur.prenom} ${auteur.nom}, ` : ''}${formatDateCourte(s.date)})`}
                  onPress={() => router.push({ pathname: '/direction/eleves/[id]', params: { id: s.eleveId } })}
                />
              );
            })}
          </Section>
        ) : null}

        <DemandesAbsence titre="À décider : absences" />

        <DocumentsAVerifier />

        <Section
          titre="Prêts pour l’examen"
          pied="Examen blanc réussi avec un enseignant que l’élève n’avait jamais eu. À placer sur les prochaines dates d’examen.">
          {prets.length === 0 ? (
            <Ligne icone="examen" titre="Aucun élève prêt pour l’instant" />
          ) : (
            prets.map(({ eleve, examen }) => {
              const evaluateur = trouverMoniteur(examen.evaluateurId);
              return (
                <Ligne
                  key={examen.id}
                  icone="examen"
                  titre={`${eleve.prenom} ${eleve.nom}`}
                  sousTitre={`Examen blanc réussi le ${formatDateCourte(`${examen.date}T12:00:00`)}${evaluateur ? ` avec ${evaluateur.prenom} ${evaluateur.nom}` : ''}`}
                  onPress={() => router.push({ pathname: '/direction/eleves/[id]', params: { id: eleve.id } })}
                />
              );
            })
          )}
        </Section>

        <Section titre="Aujourd’hui">
          {listerMoniteurs().map((moniteur) => {
            const siennes = lecons.filter((l) => l.moniteurId === moniteur.id);
            const prochaine = siennes.find((l) => new Date(l.fin) > maintenant);
            const resume =
              siennes.length === 0
                ? 'Aucune leçon'
                : `${siennes.length} leçon${siennes.length > 1 ? 's' : ''}${prochaine ? ` · prochaine à ${formatHeure(prochaine.debut)}` : ' · journée terminée'}`;
            return (
              <Ligne
                key={moniteur.id}
                icone="calendrier"
                titre={`${moniteur.prenom} ${moniteur.nom}`}
                sousTitre={resume}
                onPress={() => router.push('/direction/planning')}
              />
            );
          })}
        </Section>
      </Ecran>
    </>
  );
}
