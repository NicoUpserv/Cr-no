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
  trouverCours,
  trouverEleve,
  trouverMoniteur,
} from '@/data/depot';
import { alerteEleve } from '@/features/cours/alertes';
import { formatDans, formatHeure, formatJour, formatPiecesManquantes } from '@/lib/format';
import { ouvrirItineraire } from '@/lib/itineraire';
import { useSuiviCours } from '@/lib/suivi-cours';

export default function AccueilEleve() {
  const router = useRouter();
  const maintenant = new Date();
  const eleve = trouverEleve(idEleveConnecte());
  const lecon = eleve ? prochaineLecon(eleve.id, maintenant) : undefined;
  const cours = trouverCours(lecon?.cours?.coursId);
  const { suivi } = useSuiviCours(eleve?.id ?? '', cours?.id);
  if (!eleve) return null;

  const moniteur = lecon ? trouverMoniteur(lecon.moniteurId) : undefined;
  const meteo = lecon ? meteoPourLecon(lecon) : undefined;
  const alerte = cours && suivi && lecon ? alerteEleve(cours, suivi, formatHeure(lecon.debut)) : null;
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
            {alerte ? <NoteAttention titre={alerte.titre} preuve={alerte.preuve} /> : null}
          </Section>
        ) : null}

        {lecon ? (
          <Section>
            {cours ? (
              <Ligne
                icone={suivi?.statut === 'valide' ? 'valider' : 'cours'}
                titre={
                  suivi?.statut === 'valide'
                    ? `Cours validé : ${cours.titre}`
                    : suivi?.statut === 'commence'
                      ? `Reprendre le cours : ${cours.titre}`
                      : `Commencer le cours : ${cours.titre}`
                }
                sousTitre={suivi?.statut === 'valide' ? 'Tu peux le revoir quand tu veux' : 'Vidéos, fiches, quiz · environ 15 min'}
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
