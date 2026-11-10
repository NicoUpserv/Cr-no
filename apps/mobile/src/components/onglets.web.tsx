import { Tabs } from 'expo-router';

import { useTheme } from '@/theme/use-theme';

import type { DefinitionOnglet } from './onglets';
import { Icone } from './ui';

export type { DefinitionOnglet } from './onglets';

/** Version web : barre d'onglets du bas classique (les onglets natifs n'existent pas sur le web). */
export function Onglets({ onglets }: { onglets: DefinitionOnglet[] }) {
  const { couleurs } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: couleurs.teinte,
        tabBarInactiveTintColor: couleurs.texteSecondaire,
        tabBarStyle: { backgroundColor: couleurs.surface, borderTopColor: couleurs.separateur },
      }}>
      {onglets.map((onglet) => (
        <Tabs.Screen
          key={onglet.nom}
          name={onglet.nom}
          options={{
            title: onglet.titre,
            tabBarIcon: ({ focused }) => (
              <Icone nom={onglet.icone} taille={22} couleur={focused ? couleurs.teinte : couleurs.texteSecondaire} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
