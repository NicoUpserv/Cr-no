/** La direction modifie les disponibilités d'un enseignant depuis son téléphone. */
import { useLocalSearchParams } from 'expo-router';

import { EtatVide } from '@/components/ui';
import { trouverMoniteur } from '@/data/depot';
import { EcranDisponibilites } from '@/ecrans/disponibilites';

export default function DisponibilitesEnseignant() {
  const { moniteurId } = useLocalSearchParams<{ moniteurId: string }>();
  const moniteur = trouverMoniteur(moniteurId);
  if (!moniteur) {
    return <EtatVide icone="equipe" titre="Enseignant introuvable" message="Revenez au planning et choisissez un enseignant." />;
  }
  return <EcranDisponibilites key={moniteur.id} moniteurId={moniteur.id} titre={`Disponibilités de ${moniteur.prenom}`} />;
}
