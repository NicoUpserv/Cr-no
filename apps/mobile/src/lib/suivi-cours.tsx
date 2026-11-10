/**
 * Suivi des cours avant la leçon (démonstration : en mémoire, partagé entre les profils
 * pour qu'une validation côté élève soit visible côté enseignant).
 * Sera remplacé par la base de données.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { enregistrerTentative } from '@/features/cours/quiz';
import type { ResultatQuiz, SuiviCours } from '@/features/cours/types';

type Contexte = {
  suivis: Record<string, SuiviCours>;
  enregistrer: (eleveId: string, coursId: string, resultat: ResultatQuiz) => void;
};

const ContexteSuivi = createContext<Contexte | null>(null);
const cle = (eleveId: string, coursId: string) => `${eleveId}:${coursId}`;

export function FournisseurSuiviCours({ children }: { children: ReactNode }) {
  const [suivis, setSuivis] = useState<Record<string, SuiviCours>>({});

  const enregistrer = useCallback((eleveId: string, coursId: string, resultat: ResultatQuiz) => {
    setSuivis((actuels) => {
      const precedent = actuels[cle(eleveId, coursId)] ?? { eleveId, coursId, statut: 'non-commence', tentatives: [] };
      return { ...actuels, [cle(eleveId, coursId)]: enregistrerTentative(precedent, resultat, new Date()) };
    });
  }, []);

  return <ContexteSuivi.Provider value={{ suivis, enregistrer }}>{children}</ContexteSuivi.Provider>;
}

/** Suivi d'un cours pour un élève (non commencé par défaut). */
export function useSuiviCours(eleveId: string, coursId: string | undefined) {
  const contexte = useContext(ContexteSuivi);
  if (!contexte) throw new Error('useSuiviCours doit être utilisé dans FournisseurSuiviCours');
  const suivi: SuiviCours | undefined = coursId
    ? (contexte.suivis[cle(eleveId, coursId)] ?? { eleveId, coursId, statut: 'non-commence', tentatives: [] })
    : undefined;
  return {
    suivi,
    enregistrer: (resultat: ResultatQuiz) => {
      if (coursId) contexte.enregistrer(eleveId, coursId, resultat);
    },
  };
}
