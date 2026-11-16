import { openBrowserAsync } from 'expo-web-browser';
import { Platform } from 'react-native';

import { ADRESSE_WEB_DEMO } from '@/data/depot';

/**
 * Ouvre un document servi par le site web de l'appli (dossier `public/`) :
 * nouvel onglet sur le web (téléchargement possible), navigateur intégré sur téléphone
 * (bouton de partage du système pour l'enregistrer).
 */
export function ouvrirDocumentPublic(chemin: string) {
  if (Platform.OS === 'web') {
    window.open(chemin, '_blank', 'noopener');
    return;
  }
  void openBrowserAsync(`${ADRESSE_WEB_DEMO}${chemin}`);
}
