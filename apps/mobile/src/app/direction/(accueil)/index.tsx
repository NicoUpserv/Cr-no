/** Accueil de la direction : ce qui demande une décision, puis la journée. Vouvoiement. */
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { DemandesAbsence } from '@/components/demandes-absence';
import { Ecran, Ligne, Section } from '@/components/ui';
import {
  documentsAValider,
  elevesPretsPourLExamen,
  infosAutoEcole,
  leconsDuJour,
  listerMoniteurs,
  trouverEleve,
  trouverMoniteur,
} from '@/data/depot';
import type { DocumentRecu } from '@/data/types';
import { formatDateCourte, formatHeure, formatIlYA } from '@/lib/format';

export default function AccueilDirection() {
  const router = useRouter();
  const maintenant = new Date();
  const [documents, setDocuments] = useState<DocumentRecu[]>(documentsAValider);
  const prets = elevesPretsPourLExamen();
  const lecons = leconsDuJour(maintenant);

  const verifierDocument = (doc: DocumentRecu, nomEleve: string) => {
    const retirer = () => setDocuments((liste) => liste.filter((d) => d.id !== doc.id));
    Alert.alert(`${doc.titre} · ${nomEleve}`, 'Le document est-il lisible et conforme ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Refuser', style: 'destructive', onPress: retirer },
      { text: 'Valider', onPress: retirer },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: infosAutoEcole().nom }} />
      <Ecran>
        <DemandesAbsence titre="À décider : absences" />

        <Section titre="À vérifier : documents reçus">
          {documents.length === 0 ? (
            <Ligne icone="valider" titre="Aucun document en attente" />
          ) : (
            documents.map((doc) => {
              const eleve = trouverEleve(doc.eleveId);
              const nom = eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève';
              return (
                <Ligne
                  key={doc.id}
                  icone="document"
                  titre={`${nom} · ${doc.titre}`}
                  sousTitre={`Reçu ${formatIlYA(doc.recuLe, maintenant)}`}
                  onPress={() => verifierDocument(doc, nom)}
                  accessibilityHint="Valider ou refuser le document"
                />
              );
            })
          )}
        </Section>

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
