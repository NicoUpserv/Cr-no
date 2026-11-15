/**
 * Fiches de leçon (démonstration : en mémoire, partagées entre les profils
 * pour qu'une fiche remplie par l'enseignant soit visible par l'élève et la direction).
 *
 * ⚠️ En production, l'observation interne ne doit JAMAIS quitter le serveur pour un compte élève
 * ou parent : le filtrage `versionEleve` ici n'est qu'un affichage de démonstration.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { fichesInitiales } from '@/data/depot';
import { corrigerFiche, versionEleve } from '@/features/fiches/fiche';
import type { ChampCorrigeable, FicheLecon, FicheVueEleve, RoleEquipe } from '@/features/fiches/types';

type Contexte = {
  fiches: FicheLecon[];
  ajouter: (fiche: FicheLecon) => void;
  corriger: (
    leconId: string,
    modifications: Partial<Pick<FicheLecon, ChampCorrigeable>>,
    auteur: { id: string; role: RoleEquipe },
  ) => void;
};

const ContexteFiches = createContext<Contexte | null>(null);

export function FournisseurFichesLecon({ children }: { children: ReactNode }) {
  const [fiches, setFiches] = useState<FicheLecon[]>(fichesInitiales);

  const ajouter = useCallback((fiche: FicheLecon) => {
    setFiches((actuelles) =>
      // Une fiche validée ne se remplace pas : seule la direction la corrige.
      actuelles.some((f) => f.leconId === fiche.leconId) ? actuelles : [...actuelles, fiche],
    );
  }, []);

  const corriger = useCallback<Contexte['corriger']>((leconId, modifications, auteur) => {
    setFiches((actuelles) =>
      actuelles.map((f) => (f.leconId === leconId ? corrigerFiche(f, modifications, auteur, new Date()) : f)),
    );
  }, []);

  return <ContexteFiches.Provider value={{ fiches, ajouter, corriger }}>{children}</ContexteFiches.Provider>;
}

function useContexte() {
  const contexte = useContext(ContexteFiches);
  if (!contexte) throw new Error('Les fiches de leçon doivent être utilisées dans FournisseurFichesLecon');
  return contexte;
}

const recentesEnPremier = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date);

/** Vue équipe (enseignants et direction) : fiches complètes. */
export function useFichesEquipe() {
  return useContexte();
}

export function useFichesDeLEleve(eleveId: string): FicheLecon[] {
  return useContexte()
    .fiches.filter((f) => f.eleveId === eleveId)
    .sort(recentesEnPremier);
}

/** Vue élève : sans observation interne ni signalement. */
export function useFichesVueEleve(eleveId: string): FicheVueEleve[] {
  return useFichesDeLEleve(eleveId).map(versionEleve);
}
