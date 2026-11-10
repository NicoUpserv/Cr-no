/**
 * Profil affiché — UNIQUEMENT pour la démonstration, tant que la connexion
 * avec comptes n'existe pas. Sera remplacé par le rôle de l'utilisateur connecté.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export type Profil = 'moniteur' | 'eleve' | 'direction';

export const profils: { valeur: Profil; libelle: string; description: string; accueil: '/' | '/eleve' | '/direction' }[] = [
  { valeur: 'eleve', libelle: 'Élève', description: 'Lina Morel, permis B', accueil: '/eleve' },
  { valeur: 'moniteur', libelle: 'Enseignant', description: 'Karim Benali', accueil: '/' },
  { valeur: 'direction', libelle: 'Direction', description: 'Auto-école du Cours', accueil: '/direction' },
];

type ContexteProfil = {
  profil: Profil;
  definirProfil: (profil: Profil) => void;
};

const Contexte = createContext<ContexteProfil | null>(null);

export function FournisseurProfil({ children }: { children: ReactNode }) {
  const [profil, definirProfil] = useState<Profil>('moniteur');
  return <Contexte.Provider value={{ profil, definirProfil }}>{children}</Contexte.Provider>;
}

export function useProfil(): ContexteProfil {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error('useProfil doit être utilisé dans FournisseurProfil');
  return contexte;
}
