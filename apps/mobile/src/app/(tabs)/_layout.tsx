import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/theme/use-theme';

/** Barre d'onglets native : UITabBar sur iOS, barre de navigation Material 3 sur Android. */
export default function OngletsLayout() {
  const { couleurs } = useTheme();

  return (
    <NativeTabs tintColor={couleurs.teinte}>
      <NativeTabs.Trigger name="(aujourdhui)">
        <NativeTabs.Trigger.Label>Aujourd’hui</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="eleves">
        <NativeTabs.Trigger.Label>Élèves</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2" md="group" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="planning">
        <NativeTabs.Trigger.Label>Planning</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar.day.timeline.left" md="view_timeline" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="parcours">
        <NativeTabs.Trigger.Label>Parcours</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map" md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plus">
        <NativeTabs.Trigger.Label>Plus</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis.circle" md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
