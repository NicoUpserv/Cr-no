import { useState } from 'react';
import { Alert } from 'react-native';

import { demandesAbsenceEnAttente, trouverMoniteur } from '@/data/depot';
import type { DemandeAbsence, MotifAbsence } from '@/data/types';
import { formatPeriode } from '@/lib/format';

import { Ligne, Section } from './ui';

const motifs: Record<MotifAbsence, string> = {
  repos: 'Repos',
  conges: 'Congés',
  maladie: 'Maladie',
  autre: 'Autre',
};

/**
 * Demandes d'absence des enseignants, à accepter ou refuser par la direction.
 * Démonstration : la décision est gardée en mémoire sur l'écran.
 */
export function DemandesAbsence({ titre = 'Demandes d’absence' }: { titre?: string }) {
  const [demandes, setDemandes] = useState<DemandeAbsence[]>(demandesAbsenceEnAttente);

  if (demandes.length === 0) {
    return (
      <Section titre={titre}>
        <Ligne icone="valider" titre="Aucune demande en attente" />
      </Section>
    );
  }

  const decider = (demande: DemandeAbsence, nomComplet: string) => {
    const retirer = () => setDemandes((liste) => liste.filter((d) => d.id !== demande.id));
    Alert.alert(`Absence de ${nomComplet}`, `${motifs[demande.motif]} ${formatPeriode(demande.du, demande.au)}.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Refuser', style: 'destructive', onPress: retirer },
      { text: 'Accepter', onPress: retirer },
    ]);
  };

  return (
    <Section titre={titre} pied="Une absence acceptée bloque les créneaux de l’enseignant ; les élèves concernés sont prévenus.">
      {demandes.map((demande) => {
        const moniteur = trouverMoniteur(demande.moniteurId);
        const nom = moniteur ? `${moniteur.prenom} ${moniteur.nom}` : 'Enseignant';
        return (
          <Ligne
            key={demande.id}
            icone="horloge"
            titre={`${nom} · ${motifs[demande.motif]}`}
            sousTitre={`${formatPeriode(demande.du, demande.au)}${demande.justificatifJoint ? ' · justificatif joint' : ''}`}
            onPress={() => decider(demande, nom)}
            accessibilityHint="Accepter ou refuser la demande"
          />
        );
      })}
    </Section>
  );
}
