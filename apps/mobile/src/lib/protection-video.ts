/**
 * Protection des contenus de cours (vidéos) sur téléphone :
 * - Android : FLAG_SECURE (captures et enregistrements d'écran donnent un écran noir) ;
 * - iOS : contenu masqué dans les enregistrements (iOS 11+) et captures (iOS 13+).
 * Sur le web, aucune protection native n'existe : ce hook ne fait rien.
 * Rappel honnête : rien n'empêche de filmer l'écran avec un autre appareil.
 */
import { usePreventScreenCapture } from 'expo-screen-capture';
import { Platform } from 'react-native';

const rien = () => {};

export const useProtectionContenu: (cle?: string) => void = Platform.OS === 'web' ? rien : usePreventScreenCapture;
