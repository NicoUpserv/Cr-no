/**
 * Vérifications intérieures et extérieures (démonstration : en mémoire).
 * - L'élève y accède à la fin de la compétence C1 (pratique du client), ou plus tôt si son enseignant le débloque.
 * - L'enseignant y a toujours accès.
 * - L'élève coche les fiches qu'il maîtrise.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import type { Eleve } from '@/data/types';

import { useProgressionEleve } from './fiches-lecon';

type Contexte = {
  maitrisees: Record<string, string[]>;
  debloquees: string[];
  basculerMaitrise: (eleveId: string, numero: string) => void;
  basculerDeblocage: (eleveId: string) => void;
};

const ContexteVerifications = createContext<Contexte | null>(null);

/** Démo : Lina (élève connectée) a été débloquée par son enseignant et maîtrise déjà quelques fiches. */
const DEBLOQUEES_DEMO = ['e-morel'];
const MAITRISEES_DEMO: Record<string, string[]> = { 'e-morel': ['01', '02', '07', '11', '24', '31'] };

export function FournisseurVerifications({ children }: { children: ReactNode }) {
  const [maitrisees, setMaitrisees] = useState<Record<string, string[]>>(MAITRISEES_DEMO);
  const [debloquees, setDebloquees] = useState<string[]>(DEBLOQUEES_DEMO);

  const basculerMaitrise = useCallback((eleveId: string, numero: string) => {
    setMaitrisees((m) => {
      const actuelles = m[eleveId] ?? [];
      return { ...m, [eleveId]: actuelles.includes(numero) ? actuelles.filter((n) => n !== numero) : [...actuelles, numero] };
    });
  }, []);
  const basculerDeblocage = useCallback((eleveId: string) => {
    setDebloquees((d) => (d.includes(eleveId) ? d.filter((x) => x !== eleveId) : [...d, eleveId]));
  }, []);

  return (
    <ContexteVerifications.Provider value={{ maitrisees, debloquees, basculerMaitrise, basculerDeblocage }}>{children}</ContexteVerifications.Provider>
  );
}

function useContexte() {
  const c = useContext(ContexteVerifications);
  if (!c) throw new Error('useVerifications doit être utilisé dans FournisseurVerifications');
  return c;
}

/** Accès et suivi des vérifications pour un élève. */
export function useVerificationsEleve(eleve: Eleve | undefined) {
  const c = useContexte();
  const progression = useProgressionEleve(eleve);
  const c1 = progression.find((e) => e.code === 'C1');
  const c1Acquise = Boolean(c1 && c1.total > 0 && c1.acquises >= c1.total);
  const id = eleve?.id ?? '';
  const debloqueeParEnseignant = c.debloquees.includes(id);
  const maitrisees = c.maitrisees[id] ?? [];
  return {
    accessible: c1Acquise || debloqueeParEnseignant,
    c1Acquise,
    debloqueeParEnseignant,
    maitrisees,
    estMaitrisee: (numero: string) => maitrisees.includes(numero),
    basculerMaitrise: (numero: string) => c.basculerMaitrise(id, numero),
    basculerDeblocage: () => c.basculerDeblocage(id),
  };
}
