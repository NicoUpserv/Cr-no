import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

import type { Couleurs } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type NomSymbole = ComponentProps<typeof SymbolView>['name'];

/**
 * Catalogue des icônes de l'appli : SF Symbols sur iOS, Material Symbols
 * sur Android et web. Ajouter une icône ici plutôt que d'utiliser des emojis
 * ou des caractères Unicode.
 */
export const icones = {
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  itineraire: { ios: 'arrow.triangle.turn.up.right.diamond.fill', android: 'directions', web: 'directions' },
  attention: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  document: { ios: 'doc.text', android: 'description', web: 'description' },
  observation: { ios: 'text.bubble', android: 'chat', web: 'chat' },
  livret: { ios: 'book.closed', android: 'menu_book', web: 'menu_book' },
  telephone: { ios: 'phone.fill', android: 'call', web: 'call' },
  calendrier: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  horloge: { ios: 'clock', android: 'schedule', web: 'schedule' },
  route: { ios: 'road.lanes', android: 'road', web: 'road' },
} as const satisfies Record<string, NomSymbole>;

export type NomIcone = keyof typeof icones;

type Props = {
  nom: NomIcone;
  taille?: number;
  /** Couleur issue des tokens. Par défaut : texte secondaire. */
  couleur?: Couleurs[keyof Couleurs];
  /** Libellé pour les lecteurs d'écran ; sans libellé, l'icône est décorative. */
  libelle?: string;
};

export function Icone({ nom, taille = 20, couleur, libelle }: Props) {
  const { couleurs } = useTheme();
  return (
    <SymbolView
      name={icones[nom]}
      size={taille}
      tintColor={couleur ?? couleurs.texteSecondaire}
      accessibilityLabel={libelle}
      accessible={Boolean(libelle)}
    />
  );
}
