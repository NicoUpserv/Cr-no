/**
 * Pièces envoyées par les élèves, à vérifier par la direction (jamais par les enseignants).
 * Conforme → la pièce sort de la liste des manquantes. Refusée → l'élève reçoit un message pour la renvoyer.
 * Le choix s'affiche dans la liste (pas de boîte de dialogue : elle ne marche pas sur le web).
 */
import { useState } from 'react';

import { trouverEleve } from '@/data/depot';
import { useDossier } from '@/lib/dossier';
import { formatIlYA } from '@/lib/format';

import { Ligne, Section } from './ui';

export function DocumentsAVerifier({ eleveId, titre = 'À vérifier : documents reçus' }: { eleveId?: string; titre?: string }) {
  const { documentsAVerifier, traiterDocument } = useDossier();
  const [ouvert, setOuvert] = useState<string | null>(null);
  const documents = documentsAVerifier(eleveId);
  const maintenant = new Date();

  return (
    <Section titre={titre} pied={documents.length > 0 ? 'Une pièce refusée est redemandée à l’élève par message.' : undefined}>
      {documents.length === 0 ? (
        <Ligne icone="valider" titre="Aucun document en attente" />
      ) : (
        documents.flatMap((doc) => {
          const eleve = trouverEleve(doc.eleveId);
          const nom = eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève';
          const ligne = (
            <Ligne
              key={doc.id}
              icone="document"
              titre={eleveId ? doc.titre : `${nom} · ${doc.titre}`}
              sousTitre={`Reçu ${formatIlYA(doc.recuLe, maintenant)}`}
              onPress={() => setOuvert(ouvert === doc.id ? null : doc.id)}
              accessibilityHint="Affiche les choix : conforme ou à renvoyer"
            />
          );
          if (ouvert !== doc.id) return [ligne];
          return [
            ligne,
            <Ligne
              key={`${doc.id}-ok`}
              icone="valider"
              titre="Conforme"
              sousTitre="Lisible et valable : la pièce est ajoutée au dossier"
              onPress={() => traiterDocument(doc, true)}
            />,
            <Ligne
              key={`${doc.id}-ko`}
              icone="supprimer"
              titre="À renvoyer"
              sousTitre={`Illisible ou non conforme : ${eleve?.prenom ?? 'l’élève'} reçoit un message`}
              onPress={() => traiterDocument(doc, false)}
            />,
          ];
        })
      )}
    </Section>
  );
}
