/** Mes infos : identité et dossier de l'élève. Tutoiement. */
import { Stack } from 'expo-router';

import { Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, infosAutoEcole, trouverEleve } from '@/data/depot';
import { libellesPermis } from '@/data/types';

export default function MesInfos() {
  const eleve = trouverEleve(idEleveConnecte());
  if (!eleve) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Mes infos' }} />
      <Ecran>
        <Section titre="Identité">
          <Ligne titre={`${eleve.prenom} ${eleve.nom}`} sousTitre="Nom et prénom" />
          <Ligne icone="telephone" titre={eleve.telephone} sousTitre="Téléphone portable" />
        </Section>

        <Section titre="Ma formation">
          <Ligne titre={libellesPermis[eleve.permis]} sousTitre={`Forfait de ${eleve.forfaitLecons} leçons · ${infosAutoEcole().nom}`} />
        </Section>

        <Section
          titre="Mon dossier"
          pied="Envoie tes documents depuis ton téléphone : une photo lisible suffit. Ton auto-école les vérifie.">
          {eleve.piecesManquantes.length === 0 ? (
            <Ligne icone="valider" titre="Dossier complet" />
          ) : (
            eleve.piecesManquantes.map((piece) => (
              <Ligne key={piece} icone="document" titre={piece} sousTitre="Manquant · à envoyer" sousTitreAlerte />
            ))
          )}
        </Section>
      </Ecran>
    </>
  );
}
