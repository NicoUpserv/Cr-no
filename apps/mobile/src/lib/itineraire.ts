import { Linking, Platform } from 'react-native';

/** Ouvre l'application de cartes du téléphone sur l'itinéraire vers une adresse. */
export function ouvrirItineraire(adresse: string) {
  const destination = encodeURIComponent(adresse);
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${destination}`,
    android: `google.navigation:q=${destination}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  });
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  });
}
