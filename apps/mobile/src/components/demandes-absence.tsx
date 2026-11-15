/**
 * Demandes d'absence des enseignants, à accepter ou refuser par la direction.
 * Une absence acceptée bloque les créneaux de l'enseignant sur la période (état partagé `lib/planning`).
 * Le choix s'affiche dans la liste (pas de boîte de dialogue : elle ne marche pas sur le web).
 */
import { useState } from 'react';

import { trouverMoniteur } from '@/data/depot';
import { libellesMotifAbsence as motifs, type DemandeAbsence } from '@/data/types';
import { dateLocale } from '@/features/planning/creneaux';
import { formatPeriode } from '@/lib/format';
import { usePlanning } from '@/lib/planning';

import { Ligne, Section } from './ui';

export function DemandesAbsence({ titre = 'Demandes d’absence' }: { titre?: string }) {
  const { demandesEnAttente, traiterDemande, lecons, maintenant } = usePlanning();
  const [ouverte, setOuverte] = useState<string | null>(null);

  if (demandesEnAttente.length === 0) {
    return (
      <Section titre={titre}>
        <Ligne icone="valider" titre="Aucune demande en attente" />
      </Section>
    );
  }

  /** Leçons déjà prévues pendant l'absence : elles ne sont pas annulées automatiquement. */
  const leconsTouchees = (d: DemandeAbsence) =>
    lecons.filter(
      (l) => l.moniteurId === d.moniteurId && new Date(l.debut) > maintenant && d.du <= dateLocale(l.debut) && dateLocale(l.debut) <= d.au,
    ).length;

  return (
    <Section titre={titre} pied="Une absence acceptée bloque les créneaux de l’enseignant sur la période.">
      {demandesEnAttente.flatMap((demande) => {
        const moniteur = trouverMoniteur(demande.moniteurId);
        const nom = moniteur ? `${moniteur.prenom} ${moniteur.nom}` : 'Enseignant';
        const n = leconsTouchees(demande);
        const ligne = (
          <Ligne
            key={demande.id}
            icone="horloge"
            titre={`${nom} · ${motifs[demande.motif]}`}
            sousTitre={`${formatPeriode(demande.du, demande.au)}${demande.justificatifJoint ? ' · justificatif joint' : ''}`}
            onPress={() => setOuverte(ouverte === demande.id ? null : demande.id)}
            accessibilityHint="Affiche les choix : accepter ou refuser"
          />
        );
        if (ouverte !== demande.id) return [ligne];
        return [
          ligne,
          <Ligne
            key={`${demande.id}-accepter`}
            icone="valider"
            titre="Accepter l’absence"
            sousTitre={n > 0 ? `${n} leçon${n > 1 ? 's' : ''} déjà prévue${n > 1 ? 's' : ''} sur la période : à déplacer` : 'Aucune leçon prévue sur la période'}
            sousTitreAlerte={n > 0}
            onPress={() => traiterDemande(demande, true)}
          />,
          <Ligne key={`${demande.id}-refuser`} icone="supprimer" titre="Refuser" onPress={() => traiterDemande(demande, false)} />,
        ];
      })}
    </Section>
  );
}
