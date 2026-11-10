/** Accueil de l'élève : prochaine leçon, cours à préparer, progression, dossier. Tutoiement. */
import { Stack, useRouter } from 'expo-router';

import {
  BandeProgression,
  Ecran,
  Ligne,
  NoteAttention,
  PanneauDirection,
  Section,
} from '@/components/ui';
import {
  idEleveConnecte,
  infosAutoEcole,
  meteoPourLecon,
  prochaineLecon,
  trouverEleve,
  trouverMoniteur,
} from '@/data/depot';
import { formatDans, formatHeure, formatJour, formatPiecesManquantes } from '@/lib/format';
import { ouvrirItineraire } from '@/lib/itineraire';

export default function AccueilEleve() {
  const router = useRouter();
  const maintenant = new Date();
  const eleve = trouverEleve(idEleveConnecte());
  if (!eleve) return null;

  const lecon = prochaineLecon(eleve.id, maintenant);
  const moniteur = lecon ? trouverMoniteur(lecon.moniteurId) : undefined;
  const meteo = lecon ? meteoPourLecon(lecon) : undefined;
  const cours = lecon?.cours;
  const autoEcole = infosAutoEcole();

  return (
    <>
      <Stack.Screen options={{ title: `Bonjour ${eleve.prenom}` }} />
      <Ecran>
        {lecon ? (
          <Section titre="Ta prochaine leçon" forme="libre">
            <PanneauDirection
              lieuDepart={lecon.lieuDepart.nom}
              heureDebut={formatHeure(lecon.debut)}
              lieuFin={lecon.lieuFin.nom}
              heureFin={formatHeure(lecon.fin)}
              quand={`${formatJour(lecon.debut, maintenant)} · ${formatDans(lecon.debut, lecon.fin, maintenant)}`}
              avecQui={moniteur ? `avec ${moniteur.prenom} ${moniteur.nom}` : undefined}
              onItineraire={() => ouvrirItineraire(lecon.lieuDepart.adresse)}
            />
            {cours && cours.ouvertures === 0 ? (
              <NoteAttention
                titre={`Ton cours à faire avant la leçon : ${cours.titre}`}
                preuve={`Environ 15 min · à valider avant ${formatHeure(lecon.debut)}. Sinon, ton enseignant devra prendre du temps sur ta leçon.`}
              />
            ) : null}
          </Section>
        ) : null}

        {lecon ? (
          <Section>
            {cours ? (
              <Ligne
                icone="cours"
                titre={`Commencer le cours : ${cours.titre}`}
                sousTitre="Vidéos, fiche, quiz · environ 15 min"
                onPress={() => router.push('/eleve/cours')}
              />
            ) : null}
            {meteo ? (
              <Ligne icone="meteo" titre={`Météo prévue : ${meteo.temperature} °C, ${meteo.ciel.toLowerCase()}`} sousTitre={`À ${lecon.lieuDepart.nom}`} />
            ) : null}
            <Ligne icone="signature" titre="Signer ma présence (CPF)" sousTitre="Disponible au début de ta leçon" />
          </Section>
        ) : null}

        <Section titre="Ma progression" forme="libre">
          <BandeProgression
            etapes={eleve.competences.map((c) => ({
              code: c.code,
              libelle: c.libelle,
              acquises: c.sousCompetencesAcquises,
              total: c.sousCompetencesTotal,
            }))}
          />
        </Section>

        <Section titre="Mon dossier">
          <Ligne
            icone="document"
            titre="Pièces du dossier"
            sousTitre={
              eleve.piecesManquantes.length > 0
                ? `${formatPiecesManquantes(eleve.piecesManquantes.length)} : ${eleve.piecesManquantes.join(', ')}`
                : formatPiecesManquantes(0)
            }
            sousTitreAlerte={eleve.piecesManquantes.length > 0}
            onPress={() => router.push('/eleve/infos')}
          />
        </Section>

        {autoEcole.offre ? (
          <Section titre={`De la part de ${autoEcole.nom}`}>
            <Ligne icone="offre" titre={autoEcole.offre.titre} sousTitre={autoEcole.offre.texte} />
          </Section>
        ) : null}
      </Ecran>
    </>
  );
}
