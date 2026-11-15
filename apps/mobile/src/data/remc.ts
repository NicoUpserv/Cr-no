/**
 * Sous-compétences du livret d'apprentissage, permis B (référentiel REMC).
 * ⚠️ Libellés repris de mémoire du référentiel : à vérifier mot pour mot sur le texte officiel
 * (livret numérique, arrêté du 19/12/2023) avant la mise en production.
 */
import type { CodeCompetence, SousCompetence } from '@/features/fiches/types';

const c = (competence: CodeCompetence, lettre: string, libelle: string): SousCompetence => ({
  id: `${competence.toLowerCase()}-${lettre}`,
  competence,
  libelle,
});

export const libellesCompetences: Record<CodeCompetence, string> = {
  C1: 'Maîtriser le maniement du véhicule',
  C2: 'Appréhender la route',
  C3: 'Circuler dans des conditions difficiles',
  C4: 'Pratiquer une conduite autonome et sûre',
};

export const sousCompetencesB: SousCompetence[] = [
  c('C1', 'a', 'Connaître les principaux organes et commandes, faire les vérifications intérieures et extérieures'),
  c('C1', 'b', 'Entrer, s’installer au poste de conduite et en sortir'),
  c('C1', 'c', 'Tenir, tourner le volant et maintenir la trajectoire'),
  c('C1', 'd', 'Démarrer et s’arrêter'),
  c('C1', 'e', 'Doser l’accélération et le freinage à diverses allures'),
  c('C1', 'f', 'Utiliser la boîte de vitesses'),
  c('C1', 'g', 'Diriger la voiture en ligne droite et en courbe'),
  c('C1', 'h', 'Regarder autour de soi et avertir'),
  c('C1', 'i', 'Effectuer une marche arrière et un demi-tour en sécurité'),
  c('C2', 'a', 'Rechercher la signalisation et les indices utiles'),
  c('C2', 'b', 'Positionner le véhicule et choisir sa voie'),
  c('C2', 'c', 'Adapter l’allure aux situations'),
  c('C2', 'd', 'Franchir les intersections selon le régime de priorité'),
  c('C2', 'e', 'Tourner à droite et à gauche en agglomération'),
  c('C2', 'f', 'Franchir les ronds-points et les carrefours à sens giratoire'),
  c('C2', 'g', 'S’arrêter et stationner en épi, en bataille et en créneau'),
  c('C3', 'a', 'Évaluer et maintenir les distances de sécurité'),
  c('C3', 'b', 'Croiser, dépasser, être dépassé'),
  c('C3', 'c', 'Passer des virages et conduire en déclivité'),
  c('C3', 'd', 'Se comporter avec respect envers les autres usagers'),
  c('C3', 'e', 'S’insérer, circuler et sortir d’une voie rapide'),
  c('C3', 'f', 'Conduire dans une file et en circulation dense'),
  c('C3', 'g', 'Connaître les règles de la circulation inter-files des motos'),
  c('C3', 'h', 'Conduire quand l’adhérence et la visibilité sont réduites'),
  c('C3', 'i', 'Conduire à l’abord et dans les tunnels, ponts et autres ouvrages'),
  c('C4', 'a', 'Suivre un itinéraire de manière autonome'),
  c('C4', 'b', 'Préparer et effectuer un long trajet en autonomie'),
  c('C4', 'c', 'Connaître les facteurs de risque au volant'),
  c('C4', 'd', 'Savoir réagir en cas d’accident : protéger, alerter, secourir'),
  c('C4', 'e', 'Utiliser les aides à la conduite du véhicule'),
  c('C4', 'f', 'Notions d’entretien, de dépannage et de situations d’urgence'),
  c('C4', 'g', 'Pratiquer l’écoconduite'),
];
