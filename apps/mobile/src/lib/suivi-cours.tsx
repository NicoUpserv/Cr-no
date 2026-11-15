/**
 * Suivi des cours avant la leçon (démonstration : en mémoire, partagé entre les profils
 * pour qu'une validation côté élève soit visible côté enseignant).
 * Sera remplacé par la base de données.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { enregistrerTentative } from '@/features/cours/quiz';
import type { Cours, ResultatQuiz, SuiviCours } from '@/features/cours/types';
import { progressionVide, type ProgressionCours } from '@/features/cours/visionnage';

type Contexte = {
  suivis: Record<string, SuiviCours>;
  progressions: Record<string, ProgressionCours>;
  enregistrer: (eleveId: string, coursId: string, resultat: ResultatQuiz) => void;
  majProgression: (cle: string, depart: ProgressionCours, maj: (p: ProgressionCours) => ProgressionCours) => void;
};

const ContexteSuivi = createContext<Contexte | null>(null);
const cle = (eleveId: string, coursId: string) => `${eleveId}:${coursId}`;

export function FournisseurSuiviCours({ children }: { children: ReactNode }) {
  const [suivis, setSuivis] = useState<Record<string, SuiviCours>>({});
  const [progressions, setProgressions] = useState<Record<string, ProgressionCours>>({});

  const enregistrer = useCallback((eleveId: string, coursId: string, resultat: ResultatQuiz) => {
    setSuivis((actuels) => {
      const precedent = actuels[cle(eleveId, coursId)] ?? { eleveId, coursId, statut: 'non-commence', tentatives: [] };
      return { ...actuels, [cle(eleveId, coursId)]: enregistrerTentative(precedent, resultat, new Date()) };
    });
  }, []);

  const majProgression = useCallback(
    (c: string, depart: ProgressionCours, maj: (p: ProgressionCours) => ProgressionCours) => {
      setProgressions((actuelles) => ({ ...actuelles, [c]: maj(actuelles[c] ?? depart) }));
    },
    [],
  );

  return (
    <ContexteSuivi.Provider value={{ suivis, progressions, enregistrer, majProgression }}>{children}</ContexteSuivi.Provider>
  );
}

function useContexte() {
  const contexte = useContext(ContexteSuivi);
  if (!contexte) throw new Error('Le suivi des cours doit être utilisé dans FournisseurSuiviCours');
  return contexte;
}

/** Suivi d'un cours pour un élève (non commencé par défaut). */
export function useSuiviCours(eleveId: string, coursId: string | undefined) {
  const contexte = useContexte();
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

/** Avancement de l'élève dans les vidéos et les fiches d'un cours (verrou du quiz). */
export function useProgressionCours(eleveId: string, cours: Cours | undefined) {
  const { progressions, majProgression } = useContexte();
  const c = cours ? cle(eleveId, cours.id) : '';
  const progression = cours ? (progressions[c] ?? progressionVide(cours)) : undefined;
  const maj = useCallback(
    (fn: (p: ProgressionCours) => ProgressionCours) => {
      if (cours) majProgression(c, progressionVide(cours), fn);
    },
    [c, cours, majProgression],
  );
  return { progression, majProgression: maj };
}
