/** Mes infos : identité et dossier de l'élève. Tutoiement. */
import { Stack } from 'expo-router';

import { Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, infosAutoEcole, trouverEleve } from '@/data/depot';
import { libellesPermis } from '@/data/types';
import { useDossier } from '@/lib/dossier';

export default function MesInfos() {
  const eleve = trouverEleve(idEleveConnecte());
  const dossier = useDossier();
  if (!eleve) return null;
  const manquantes = dossier.piecesManquantes(eleve.id);

  return (
    <>
      <Stack.Screen options={{ title: 'Mes infos' }} />
      <Ecran>
        <Section titre="Identité">
          <Ligne titre={`${eleve.prenom} ${eleve.nom}`} sousTitre="Nom et prénom" />
          <Ligne icone="telephone" titre={eleve.telephone} sousTitre="Téléphone portable" />
          <Ligne icone="accueil" titre={eleve.adresse} sousTitre="Adresse" />
        </Section>

        <Section titre="Ma formation">
          <Ligne titre={libellesPermis[eleve.permis]} sousTitre={`Forfait de ${eleve.forfaitLecons} leçons · ${infosAutoEcole().nom}`} />
        </Section>

        <Section
          titre="Mon dossier"
          pied="Touche une pièce pour l’envoyer : une photo lisible suffit. Seule ton auto-école la voit (dans la démo, l’envoi est simulé).">
          {manquantes.length === 0 ? (
            <Ligne icone="valider" titre="Dossier complet" />
          ) : (
            manquantes.map((piece) => {
              const enVerif = dossier.statutPiece(eleve.id, piece) === 'en-verification';
              return (
                <Ligne
                  key={piece}
                  icone="document"
                  titre={piece}
                  sousTitre={enVerif ? 'Envoyée · en cours de vérification' : 'Manquante · touche pour l’envoyer'}
                  sousTitreAlerte={!enVerif}
                  onPress={enVerif ? undefined : () => dossier.envoyerPiece(eleve.id, piece)}
                />
              );
            })
          )}
        </Section>
      </Ecran>
    </>
  );
}
