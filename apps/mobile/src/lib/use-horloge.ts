/** Heure courante rafraîchie à intervalle régulier (comptes à rebours). */
import { useEffect, useState } from 'react';

export function useHorloge(intervalleMs = 30_000): Date {
  const [maintenant, setMaintenant] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setMaintenant(new Date()), intervalleMs);
    return () => clearInterval(id);
  }, [intervalleMs]);
  return maintenant;
}
