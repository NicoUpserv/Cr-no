import { NativeTabs } from 'expo-router/native-tabs';
import type { AndroidSymbol } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from '@/theme/use-theme';

import type { NomIcone } from './ui';

export type DefinitionOnglet = {
  /** Nom du dossier de route (ex. « (accueil) », « planning »). */
  nom: string;
  titre: string;
  /** SF Symbol (iOS). */
  sf: SFSymbol;
  /** Material Symbol (Android). */
  md: AndroidSymbol;
  /** Icône du catalogue, pour la version web. */
  icone: NomIcone;
};

/** Barre d'onglets native : UITabBar sur iOS, barre de navigation Material 3 sur Android. */
export function Onglets({ onglets }: { onglets: DefinitionOnglet[] }) {
  const { couleurs } = useTheme();
  return (
    <NativeTabs tintColor={couleurs.teinte}>
      {onglets.map((onglet) => (
        <NativeTabs.Trigger key={onglet.nom} name={onglet.nom}>
          <NativeTabs.Trigger.Label>{onglet.titre}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={onglet.sf} md={onglet.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
