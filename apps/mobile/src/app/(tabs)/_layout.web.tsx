import { Tabs } from 'expo-router';

import { Icone, type NomIcone } from '@/components/ui';
import { useTheme } from '@/theme/use-theme';

/**
 * Version web de la barre d'onglets : barre du bas classique.
 * (Sur iOS et Android, `_layout.tsx` utilise les onglets natifs du système.)
 */
const onglets: { nom: string; titre: string; icone: NomIcone }[] = [
  { nom: '(aujourdhui)', titre: 'Aujourd’hui', icone: 'calendrier' },
  { nom: 'eleves', titre: 'Élèves', icone: 'document' },
  { nom: 'planning', titre: 'Planning', icone: 'horloge' },
  { nom: 'parcours', titre: 'Parcours', icone: 'route' },
  { nom: 'plus', titre: 'Plus', icone: 'livret' },
];

export default function OngletsLayoutWeb() {
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
