/**
 * Voiture 3D (page web autonome `public/voiture-3d`, three.js) affichée dans une WebView sur téléphone.
 * La page prévient l'appli quand l'utilisateur veut voir les fiches d'une zone.
 */
import { WebView } from 'react-native-webview';

import { ADRESSE_WEB_DEMO } from '@/data/depot';

import type { PropsVueVoiture3d } from './vue-voiture-3d.types';

export function VueVoiture3d({ zone, sombre, onZone }: PropsVueVoiture3d) {
  const adresse = `${ADRESSE_WEB_DEMO}/voiture-3d/index.html?appli=1&theme=${sombre ? 'sombre' : 'clair'}${zone ? `&zone=${zone}` : ''}`;
  return (
    <WebView
      source={{ uri: adresse }}
      style={{ flex: 1 }}
      originWhitelist={['https://*']}
      onMessage={(e) => {
        try {
          const message = JSON.parse(e.nativeEvent.data) as { type?: string; zone?: string };
          if (message.type === 'zone' && message.zone) onZone(message.zone);
        } catch {
          // Message inattendu : ignoré.
        }
      }}
      accessibilityLabel="Voiture en 3D : faites-la tourner et touchez les points jaunes"
    />
  );
}
