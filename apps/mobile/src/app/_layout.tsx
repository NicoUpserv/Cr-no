import { BarlowCondensed_700Bold, useFonts } from '@expo-google-fonts/barlow-condensed';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { FournisseurProfil } from '@/lib/profil';
import { FournisseurSuiviCours } from '@/lib/suivi-cours';
import { useTheme } from '@/theme/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RacineLayout() {
  const [policesChargees, erreurPolices] = useFonts({ BarlowCondensed_700Bold });
  const { sombre, couleurs } = useTheme();

  useEffect(() => {
    if (policesChargees || erreurPolices) SplashScreen.hideAsync();
  }, [policesChargees, erreurPolices]);

  if (!policesChargees && !erreurPolices) return null;

  const base = sombre ? DarkTheme : DefaultTheme;
  const themeNavigation = {
    ...base,
    colors: {
      ...base.colors,
      primary: couleurs.teinte,
      background: couleurs.fond,
      card: couleurs.fond,
      text: couleurs.texte,
      border: couleurs.separateur,
    },
  };

  return (
    <FournisseurProfil>
      <FournisseurSuiviCours>
        <ThemeProvider value={themeNavigation}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
        </ThemeProvider>
      </FournisseurSuiviCours>
    </FournisseurProfil>
  );
}
