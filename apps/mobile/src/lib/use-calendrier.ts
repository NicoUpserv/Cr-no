/** État d'un planning en calendrier : vue choisie (jour / semaine / mois / année) et date affichée. */
import { useState } from 'react';

import { contientAujourdhui, decaler, titrePeriode, type VueCalendrier } from '@/features/planning/calendrier';
import { dateLocale } from '@/features/planning/creneaux';

export function useCalendrier(maintenant: Date, vueInitiale: VueCalendrier = 'jour') {
  const [vue, setVue] = useState<VueCalendrier>(vueInitiale);
  const [date, setDate] = useState(() => dateLocale(maintenant));
  return {
    vue,
    setVue,
    date,
    titre: titrePeriode(date, vue),
    precedent: () => setDate((d) => decaler(d, vue, -1)),
    suivant: () => setDate((d) => decaler(d, vue, 1)),
    /** Absent quand la période affichée contient déjà aujourd'hui. */
    aujourdhui: contientAujourdhui(date, vue, maintenant) ? undefined : () => setDate(dateLocale(maintenant)),
    /** Depuis la semaine ou le mois : ouvrir un jour précis. */
    ouvrirJour: (jour: string) => {
      setDate(jour);
      setVue('jour');
    },
    /** Depuis l'année : ouvrir un mois. */
    ouvrirMois: (premierDuMois: string) => {
      setDate(premierDuMois);
      setVue('mois');
    },
  };
}
